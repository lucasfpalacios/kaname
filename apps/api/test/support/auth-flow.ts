import type { INestApplication } from "@nestjs/common";
import { CLIENT_IP_HEADER, PROXY_SECRET_HEADER } from "@kaname/shared";
import request from "supertest";
import type { App } from "supertest/types.js";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "../../src/auth/cookies.js";
import { SESSION_MAX_AGE_DAYS } from "../../src/auth/auth.service.js";
import { SESSION_RATE_LIMIT } from "../../src/auth/rate-limit.js";
import { fromIp } from "./client-ip.js";

// Flujo de autenticación por HTTP, compartido entre la versión sin base (src/auth/*.spec.ts) y
// la de Postgres real (test/*.e2e-spec.ts).

export type AuthFlowContext = {
  /** App con configureApp aplicado. Una por test: el rate limit arranca en cero. */
  createApp: () => Promise<INestApplication<App>>;
  /** Crea un usuario con esa contraseña (y ese idioma) y devuelve su email. */
  createUser: (password: string, locale?: "es" | "en") => Promise<string>;
  /** Sesiones vivas del usuario. */
  countSessions: (email: string) => Promise<number>;
  /** Corre la última rotación de las sesiones del usuario tantos segundos hacia atrás. */
  ageRotation: (email: string, seconds: number) => Promise<void>;
  /** Corre el inicio (createdAt) de las sesiones del usuario tantos días hacia atrás. */
  ageSessions: (email: string, days: number) => Promise<void>;
  /** Vence los links de recuperación del usuario. */
  expireResetTokens: (email: string) => Promise<void>;
  /** Anota un email creado fuera de createUser (registro) para borrarlo en cleanup. */
  trackEmail: (email: string) => void;
  cleanup: () => Promise<void>;
};

const PASSWORD = "una contraseña larga y segura";

/** Cookies de una respuesta: nombre → valor y la línea Set-Cookie completa. */
export function cookiesOf(response: request.Response) {
  const lines =
    (response.headers["set-cookie"] as unknown as string[] | undefined) ?? [];
  const byName = new Map<string, { value: string; line: string }>();
  for (const line of lines) {
    const [pair] = line.split(";");
    const index = pair.indexOf("=");
    byName.set(pair.slice(0, index), {
      value: decodeURIComponent(pair.slice(index + 1)),
      line,
    });
  }
  return byName;
}

export const cookieHeader = (cookies: Record<string, string>) =>
  Object.entries(cookies)
    .map(([name, value]) => `${name}=${encodeURIComponent(value)}`)
    .join("; ");

/** Ciclo de vida común: una app y un contexto nuevos por test. */
function useApp(context: () => AuthFlowContext) {
  const state = {} as { app: INestApplication<App>; ctx: AuthFlowContext };
  beforeEach(async () => {
    state.ctx = context();
    state.app = await state.ctx.createApp();
  });
  afterEach(async () => {
    await state.app.close();
    await state.ctx.cleanup();
  });
  return state;
}

export function authFlowTests(name: string, context: () => AuthFlowContext) {
  describe(name, () => {
    const state = useApp(context);
    const http = () => request(state.app.getHttpServer());

    async function login(email: string, password = PASSWORD, ip?: string) {
      let call = http().post("/api/auth/login");
      if (ip) call = call.set(fromIp(ip));
      const response = await call.send({ email, password });
      const cookies = cookiesOf(response);
      return {
        response,
        access: cookies.get(ACCESS_COOKIE)?.value ?? "",
        refresh: cookies.get(REFRESH_COOKIE)?.value ?? "",
        cookies,
      };
    }

    const me = (access: string) =>
      http()
        .get("/api/auth/me")
        .set("Cookie", cookieHeader({ [ACCESS_COOKIE]: access }));

    const refresh = (token: string) =>
      http()
        .post("/api/auth/refresh")
        .set("Cookie", cookieHeader({ [REFRESH_COOKIE]: token }));

    it("login correcto: devuelve el usuario y deja las dos cookies httpOnly", async () => {
      const email = await state.ctx.createUser(PASSWORD);
      const {
        response,
        access,
        refresh: refreshToken,
        cookies,
      } = await login(email);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({ email });
      expect(response.body).not.toHaveProperty("passwordHash");
      expect(access).not.toBe("");
      expect(refreshToken).not.toBe("");

      const accessLine = cookies.get(ACCESS_COOKIE)!.line;
      const refreshLine = cookies.get(REFRESH_COOKIE)!.line;
      expect(accessLine).toMatch(/HttpOnly/);
      expect(accessLine).toMatch(/SameSite=Lax/);
      expect(accessLine).toMatch(/Path=\/;/);
      expect(accessLine).toMatch(/Max-Age=900/);
      expect(refreshLine).toMatch(/HttpOnly/);
      expect(refreshLine).toMatch(/Path=\/;/);
      expect(refreshLine).toMatch(/Max-Age=2592000/);

      const meResponse = await me(access);
      expect(meResponse.status).toBe(200);
      expect(meResponse.body).toMatchObject({ email });
    });

    it("login incorrecto: el mismo error si la contraseña no coincide o el email no existe", async () => {
      const email = await state.ctx.createUser(PASSWORD);
      const wrongPassword = await login(email, "otra contraseña");
      const unknownEmail = await login("nadie@kaname.test", PASSWORD);

      expect(wrongPassword.response.status).toBe(401);
      expect(unknownEmail.response.status).toBe(401);
      expect(wrongPassword.response.body).toEqual(unknownEmail.response.body);
      expect(wrongPassword.response.body.message).toBe("invalid_credentials");
      expect(wrongPassword.cookies.size).toBe(0);
    });

    it("login con datos inválidos: 400 con códigos de validación", async () => {
      const response = await http()
        .post("/api/auth/login")
        .send({ email: "no-es-un-email", password: "" });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("validation_failed");
    });

    it("refresh: rota el refresh token y emite un access nuevo", async () => {
      const email = await state.ctx.createUser(PASSWORD);
      const first = await login(email);

      const response = await refresh(first.refresh);
      expect(response.status).toBe(204);
      const cookies = cookiesOf(response);
      const newRefresh = cookies.get(REFRESH_COOKIE)!.value;
      const newAccess = cookies.get(ACCESS_COOKIE)!.value;
      expect(newRefresh).not.toBe(first.refresh);
      // Misma sesión, otro secreto.
      expect(newRefresh.split(".")[0]).toBe(first.refresh.split(".")[0]);

      expect((await me(newAccess)).status).toBe(200);
      expect((await refresh(newRefresh)).status).toBe(204);
    });

    it("refresh concurrente: el refresh anterior dentro de los 30 s da 401 sin revocar nada", async () => {
      const email = await state.ctx.createUser(PASSWORD);
      const tab = await login(email);
      const otherDevice = await login(email);

      const rotated = await refresh(tab.refresh);
      expect(rotated.status).toBe(204);
      const current = cookiesOf(rotated).get(REFRESH_COOKIE)!.value;

      // La otra pestaña llega con el refresh que se acaba de rotar.
      const late = await refresh(tab.refresh);
      expect(late.status).toBe(401);

      // Nada se revocó: el refresh vigente y la otra sesión siguen andando.
      expect(await state.ctx.countSessions(email)).toBe(2);
      expect((await refresh(current)).status).toBe(204);
      expect((await me(otherDevice.access)).status).toBe(200);
    });

    it("reutilizar un refresh rotado hace más de 30 s revoca todas las sesiones del usuario", async () => {
      const email = await state.ctx.createUser(PASSWORD);
      const stolen = await login(email);
      const otherDevice = await login(email);
      expect(await state.ctx.countSessions(email)).toBe(2);

      const rotated = await refresh(stolen.refresh);
      expect(rotated.status).toBe(204);
      const current = cookiesOf(rotated).get(REFRESH_COOKIE)!.value;
      await state.ctx.ageRotation(email, 31);

      // El refresh viejo vuelve a aparecer pasado el margen: posible robo.
      const reuse = await refresh(stolen.refresh);
      expect(reuse.status).toBe(401);
      expect(reuse.body.message).toBe("unauthenticated");
      expect(await state.ctx.countSessions(email)).toBe(0);

      // Ni el refresh vigente ni las otras sesiones sirven más, y el access deja de valer.
      expect((await refresh(current)).status).toBe(401);
      expect((await refresh(otherDevice.refresh)).status).toBe(401);
      expect((await me(otherDevice.access)).status).toBe(401);
    });

    it("refresh con un secreto inventado: 401 sin revocar nada", async () => {
      const email = await state.ctx.createUser(PASSWORD);
      const victim = await login(email);
      const otherDevice = await login(email);
      const sessionId = victim.refresh.split(".")[0];

      // Con solo el id de la sesión (va en el access) no se puede desloguear a nadie.
      const forged = await refresh(`${sessionId}.inventado`);
      expect(forged.status).toBe(401);
      expect(await state.ctx.countSessions(email)).toBe(2);
      expect((await refresh(victim.refresh)).status).toBe(204);
      expect((await me(otherDevice.access)).status).toBe(200);
    });

    it(`rate limit de sesión: refresh y logout dan 429 después de ${SESSION_RATE_LIMIT} pedidos por minuto`, async () => {
      for (const path of ["/api/auth/refresh", "/api/auth/logout"]) {
        for (let attempt = 0; attempt < SESSION_RATE_LIMIT; attempt++) {
          expect((await http().post(path)).status).not.toBe(429);
        }
        const blocked = await http().post(path);
        expect(blocked.status).toBe(429);
        expect(blocked.body.message).toBe("too_many_attempts");
      }
    });

    it(`vida máxima: una sesión de más de ${SESSION_MAX_AGE_DAYS} días no se renueva aunque haya rotado`, async () => {
      const email = await state.ctx.createUser(PASSWORD);
      const recent = await login(email);
      const rotated = await refresh(recent.refresh);
      expect(rotated.status).toBe(204);
      const current = cookiesOf(rotated).get(REFRESH_COOKIE)!.value;

      await state.ctx.ageSessions(email, SESSION_MAX_AGE_DAYS + 1);
      expect((await refresh(current)).status).toBe(401);
      expect(await state.ctx.countSessions(email)).toBe(0);
    });

    it("logout: cierra la sesión y borra las cookies", async () => {
      const email = await state.ctx.createUser(PASSWORD);
      const session = await login(email);

      const response = await http()
        .post("/api/auth/logout")
        .set(
          "Cookie",
          cookieHeader({
            [ACCESS_COOKIE]: session.access,
            [REFRESH_COOKIE]: session.refresh,
          }),
        );
      expect(response.status).toBe(204);
      const cleared = cookiesOf(response);
      expect(cleared.get(ACCESS_COOKIE)?.line).toMatch(
        /Expires=Thu, 01 Jan 1970/,
      );
      expect(cleared.get(REFRESH_COOKIE)?.line).toMatch(
        /Expires=Thu, 01 Jan 1970/,
      );

      expect(await state.ctx.countSessions(email)).toBe(0);
      expect((await me(session.access)).status).toBe(401);
      expect((await refresh(session.refresh)).status).toBe(401);
    });

    it("/auth/me sin sesión: 401", async () => {
      const response = await http().get("/api/auth/me");
      expect(response.status).toBe(401);
      expect(response.body.message).toBe("unauthenticated");
      expect((await me("no-es-un-jwt")).status).toBe(401);
    });

    it("refresh sin cookie o con un token mal formado: 401", async () => {
      expect((await http().post("/api/auth/refresh")).status).toBe(401);
      expect((await refresh("basura")).status).toBe(401);
    });

    it("rate limit por IP: después de 5 intentos responde 429", async () => {
      const email = await state.ctx.createUser(PASSWORD);
      for (let attempt = 0; attempt < 5; attempt++) {
        expect((await login(email, "mal")).response.status).toBe(401);
      }
      const blocked = await login(email, PASSWORD);
      expect(blocked.response.status).toBe(429);
      expect(blocked.response.body.message).toBe("too_many_attempts");
      // Otra IP (la que manda el proxy de Next con el secreto) todavía puede entrar.
      expect(
        (await login(email, PASSWORD, "203.0.113.50")).response.status,
      ).toBe(200);
    });

    it("IP falsa: ni X-Forwarded-For ni el header del proxy con un secreto inválido esquivan el límite por IP", async () => {
      const email = await state.ctx.createUser(PASSWORD);
      const attempt = (index: number, headers: Record<string, string>) =>
        http()
          .post("/api/auth/login")
          .set(headers)
          .send({ email, password: index < 5 ? "mal" : PASSWORD });
      const spoofed: Record<string, string>[] = [
        { "X-Forwarded-For": "203.0.113.1" },
        { "X-Forwarded-For": "203.0.113.2, 198.51.100.2" },
        { ...fromIp("203.0.113.3"), [PROXY_SECRET_HEADER]: "otro-secreto" },
        { [CLIENT_IP_HEADER]: "203.0.113.4" },
        { ...fromIp("203.0.113.5"), [PROXY_SECRET_HEADER]: "" },
      ];
      for (const [index, headers] of spoofed.entries()) {
        expect((await attempt(index, headers)).status).toBe(401);
      }
      // Los cinco contaron como la misma IP (la de la conexión): el sexto se bloquea.
      const blocked = await attempt(5, {
        "X-Forwarded-For": "203.0.113.6",
      });
      expect(blocked.status).toBe(429);
    });

    it("rate limit por email: 10 intentos desde IPs distintas, el 11.º da 429", async () => {
      const email = await state.ctx.createUser(PASSWORD);
      for (let attempt = 0; attempt < 10; attempt++) {
        const ip = `198.51.100.${attempt + 1}`;
        expect((await login(email, "mal", ip)).response.status).toBe(401);
      }
      const blocked = await login(email, PASSWORD, "198.51.100.99");
      expect(blocked.response.status).toBe(429);
      // Otro email desde esa IP no está bloqueado.
      const other = await state.ctx.createUser(PASSWORD);
      expect(
        (await login(other, PASSWORD, "198.51.100.99")).response.status,
      ).toBe(200);
    });

    it("CSRF: un POST desde otro origen da 403 y uno con body que no es JSON da 415", async () => {
      const email = await state.ctx.createUser(PASSWORD);
      const evil = await http()
        .post("/api/auth/login")
        .set("Origin", "https://otro-sitio.example")
        .send({ email, password: PASSWORD });
      expect(evil.status).toBe(403);
      expect(evil.body.message).toBe("forbidden");
      expect(cookiesOf(evil).has(ACCESS_COOKIE)).toBe(false);
      const nullOrigin = await http()
        .post("/api/auth/logout")
        .set("Origin", "null");
      expect(nullOrigin.status).toBe(403);

      // Lo que manda un <form>: urlencoded o text/plain.
      const form = await http()
        .post("/api/auth/login")
        .type("form")
        .send({ email, password: PASSWORD });
      expect(form.status).toBe(415);
      expect(form.body.message).toBe("unsupported_media_type");
      const text = await http()
        .post("/api/auth/login")
        .set("Content-Type", "text/plain")
        .send(JSON.stringify({ email, password: PASSWORD }));
      expect(text.status).toBe(415);

      // Desde la web (mismo origen, JSON) anda; sin body (logout) también.
      const web = await http()
        .post("/api/auth/login")
        .set("Origin", "http://localhost:3000")
        .send({ email, password: PASSWORD });
      expect(web.status).toBe(200);
      expect(
        (
          await http()
            .post("/api/auth/logout")
            .set("Origin", "http://localhost:3000")
        ).status,
      ).toBe(204);
    });

    it("options: informa que el registro está cerrado", async () => {
      const response = await http().get("/api/auth/options");
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({ registrationEnabled: false });
    });

    it("registro cerrado: 403 aunque el body sea válido", async () => {
      const response = await http().post("/api/auth/register").send({
        name: "Nueva persona",
        email: "nueva@kaname.test",
        password: PASSWORD,
      });
      expect(response.status).toBe(403);
      expect(response.body.message).toBe("registration_disabled");
      expect(cookiesOf(response).size).toBe(0);
    });
  });
}

/** Registro con REGISTRATION_ENABLED=true (archivos que lo activan con vi.hoisted). */
export function registerTests(name: string, context: () => AuthFlowContext) {
  describe(name, () => {
    const state = useApp(context);
    const http = () => request(state.app.getHttpServer());
    const register = (body: object) =>
      http().post("/api/auth/register").send(body);

    it("crea el usuario, inicia la sesión y después puede entrar con su contraseña", async () => {
      const email = `nuevo-${Date.now()}@kaname.test`;
      state.ctx.trackEmail(email);
      const response = await register({
        name: "  Nueva persona ",
        email: email.toUpperCase(),
        password: PASSWORD,
      });
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({ email, name: "Nueva persona" });
      const access = cookiesOf(response).get(ACCESS_COOKIE)!.value;

      const me = await http()
        .get("/api/auth/me")
        .set("Cookie", cookieHeader({ [ACCESS_COOKIE]: access }));
      expect(me.status).toBe(200);

      const login = await http()
        .post("/api/auth/login")
        .send({ email, password: PASSWORD });
      expect(login.status).toBe(200);
    });

    it("options: informa que el registro está abierto", async () => {
      const response = await http().get("/api/auth/options");
      expect(response.body).toMatchObject({ registrationEnabled: true });
    });

    it("email ya registrado: 409", async () => {
      const email = await state.ctx.createUser(PASSWORD);
      const response = await register({
        name: "Otra persona",
        email,
        password: PASSWORD,
      });
      expect(response.status).toBe(409);
      expect(response.body.message).toBe("email_taken");
    });

    it("contraseña corta o datos faltantes: 400 con códigos", async () => {
      const response = await register({
        name: "",
        email: "x@kaname.test",
        password: "corta",
      });
      expect(response.status).toBe(400);
      const codes = (response.body.issues as { code: string }[]).map(
        (issue) => issue.code,
      );
      expect(codes).toEqual(
        expect.arrayContaining(["name_required", "password_too_short"]),
      );
    });
  });
}
