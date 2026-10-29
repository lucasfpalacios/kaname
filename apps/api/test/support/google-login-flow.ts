import { createHash } from "node:crypto";
import type { INestApplication } from "@nestjs/common";
import { ErrorCode } from "@kaname/shared";
import request from "supertest";
import type { App } from "supertest/types.js";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "../../src/auth/cookies.js";
import { SESSION_RATE_LIMIT } from "../../src/auth/rate-limit.js";
import { cookieHeader, cookiesOf } from "./auth-flow.js";
import type { TestContext } from "./contexts.js";
import { fromIp } from "./client-ip.js";

// Login con Google por HTTP, en memoria (src/auth/google/google-auth.spec.ts) y contra Postgres
// (test/google-auth.e2e-spec.ts). Google se reemplaza por FakeGoogle: el test decide qué id_token
// devuelve el canje de cada código.

const CLIENT_ID = "cliente-de-prueba.apps.googleusercontent.com";
const STATE_COOKIE = "kaname_oauth";
const PASSWORD = "una contraseña larga y segura";

type Started = { state: string; nonce: string; cookie: string };

function useGoogleApp(context: () => TestContext) {
  const state = {} as { app: INestApplication<App>; ctx: TestContext };
  let ip = 0;
  beforeEach(async () => {
    state.ctx = context();
    state.app = await state.ctx.createApp();
  });
  afterEach(async () => {
    await state.app.close();
    await state.ctx.cleanup();
  });

  const http = () => request(state.app.getHttpServer());

  /** GET /api/auth/google: el state y el nonce que viajan a Google, y la cookie del flujo. */
  async function start(query: Record<string, string> = {}): Promise<Started> {
    const response = await http()
      .get("/api/auth/google")
      .query(query)
      .set(fromIp(`198.19.0.${++ip}`));
    expect(response.status).toBe(302);
    const url = new URL(response.headers.location as string);
    return {
      state: url.searchParams.get("state")!,
      nonce: url.searchParams.get("nonce")!,
      cookie: cookiesOf(response).get(STATE_COOKIE)!.value,
    };
  }

  /** Vuelta de Google al callback, con el código y el state que el test elija. */
  function callback(started: Started | null, query: Record<string, string>) {
    let call = http().get("/api/auth/google/callback").query(query);
    if (started) {
      call = call.set(
        "Cookie",
        cookieHeader({ [STATE_COOKIE]: started.cookie }),
      );
    }
    return call;
  }

  /** Claims válidos de un id_token para ese inicio de flujo. */
  const claims = (
    started: Started,
    extra: Record<string, unknown> = {},
  ): Record<string, unknown> => ({
    iss: "https://accounts.google.com",
    aud: CLIENT_ID,
    exp: Math.floor(Date.now() / 1000) + 300,
    nonce: started.nonce,
    sub: `google-${Math.random().toString(36).slice(2)}`,
    email: `google-${Date.now()}-${++ip}@kaname.test`,
    email_verified: true,
    name: "Persona de Google",
    ...extra,
  });

  /** Flujo completo: inicio, Google devuelve esos claims y vuelve al callback. */
  async function loginWith(
    extra:
      Record<string, unknown> | ((started: Started) => Record<string, unknown>),
    query: Record<string, string> = {},
  ) {
    const started = await start(query);
    const code = `codigo-${++ip}`;
    const custom = typeof extra === "function" ? extra(started) : extra;
    state.ctx.google.respond(code, claims(started, custom));
    return callback(started, { code, state: started.state });
  }

  return { state, http, start, callback, claims, loginWith };
}

const errorRedirect = (code: string) => `/login?error=${code}`;

function expectNoSession(response: request.Response) {
  const cookies = cookiesOf(response);
  expect(cookies.has(ACCESS_COOKIE)).toBe(false);
  expect(cookies.has(REFRESH_COOKIE)).toBe(false);
}

export function googleLoginTests(name: string, context: () => TestContext) {
  describe(name, () => {
    const { state, http, start, callback, loginWith } = useGoogleApp(context);

    it("inicio: redirige a Google con PKCE (S256), state y nonce, y guarda el flujo en una cookie httpOnly", async () => {
      const response = await http()
        .get("/api/auth/google")
        .query({ next: "/espacios" });
      expect(response.status).toBe(302);
      const url = new URL(response.headers.location as string);
      expect(url.origin + url.pathname).toBe(
        "https://accounts.google.com/o/oauth2/v2/auth",
      );
      expect(url.searchParams.get("client_id")).toBe(CLIENT_ID);
      expect(url.searchParams.get("redirect_uri")).toBe(
        "http://localhost:3000/api/auth/google/callback",
      );
      expect(url.searchParams.get("code_challenge_method")).toBe("S256");
      expect(url.searchParams.get("state")).toMatch(/^[\w-]{43}$/);
      expect(url.searchParams.get("nonce")).toMatch(/^[\w-]{43}$/);
      const cookie = cookiesOf(response).get(STATE_COOKIE)!.line;
      expect(cookie).toMatch(/HttpOnly/);
      expect(cookie).toMatch(/SameSite=Lax/);
      expect(cookie).toMatch(/Path=\/api\/auth\/google/);
    });

    it(`callback: 429 después de ${SESSION_RATE_LIMIT} pedidos por minuto desde la misma IP`, async () => {
      for (let attempt = 0; attempt < SESSION_RATE_LIMIT; attempt++) {
        const response = await callback(null, { code: "x", state: "x" });
        expect(response.status).toBe(302);
      }
      const blocked = await callback(null, { code: "x", state: "x" });
      expect(blocked.status).toBe(429);
    });

    it("state inválido: vuelve al login con error, sin canjear el código ni crear sesión", async () => {
      const started = await start();
      state.ctx.google.respond("codigo", { sub: "x" });

      const wrongState = await callback(started, {
        code: "codigo",
        state: `${started.state.slice(0, -1)}x`,
      });
      const noCookie = await callback(null, {
        code: "codigo",
        state: started.state,
      });
      const forged = await callback(
        { ...started, cookie: `${started.cookie.split(".")[0]}.firma-falsa` },
        { code: "codigo", state: started.state },
      );

      for (const response of [wrongState, noCookie, forged]) {
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe(
          errorRedirect(ErrorCode.oauthFailed),
        );
        expectNoSession(response);
      }
      expect(state.ctx.google.exchanges).toHaveLength(0);
    });

    it("el canje usa el code_verifier del inicio (PKCE) y la cookie del flujo se borra", async () => {
      const email = await state.ctx.createUser(PASSWORD);
      const response = await http()
        .get("/api/auth/google")
        .set(fromIp("198.19.1.1"));
      const url = new URL(response.headers.location as string);
      const started: Started = {
        state: url.searchParams.get("state")!,
        nonce: url.searchParams.get("nonce")!,
        cookie: cookiesOf(response).get(STATE_COOKIE)!.value,
      };
      state.ctx.google.respond("codigo-pkce", {
        iss: "accounts.google.com",
        aud: CLIENT_ID,
        exp: Math.floor(Date.now() / 1000) + 300,
        nonce: started.nonce,
        sub: "sub-pkce",
        email,
        email_verified: true,
      });
      const back = await callback(started, {
        code: "codigo-pkce",
        state: started.state,
      });
      expect(back.status).toBe(302);

      const [{ codeVerifier }] = state.ctx.google.exchanges;
      expect(
        createHash("sha256").update(codeVerifier).digest("base64url"),
      ).toBe(url.searchParams.get("code_challenge"));
      expect(cookiesOf(back).get(STATE_COOKIE)!.line).toMatch(
        /Expires=Thu, 01 Jan 1970/,
      );
    });

    it("email no verificado por Google: se rechaza y no se vincula nada", async () => {
      const email = await state.ctx.createUser(PASSWORD);
      const response = await loginWith({ email, email_verified: false });
      expect(response.status).toBe(302);
      expect(response.headers.location).toBe(
        errorRedirect(ErrorCode.googleEmailUnverified),
      );
      expectNoSession(response);
      expect(await state.ctx.googleSubjects(email)).toEqual([]);
    });

    it("usuario existente: se vincula, inicia la sesión con las cookies del login y vuelve al destino", async () => {
      const email = await state.ctx.createUser(PASSWORD);
      const response = await loginWith(
        { email: email.toUpperCase(), sub: "sub-existente" },
        { next: "/espacios?tab=1" },
      );
      expect(response.status).toBe(302);
      expect(response.headers.location).toBe("/espacios?tab=1");
      const cookies = cookiesOf(response);
      expect(cookies.get(ACCESS_COOKIE)!.line).toMatch(/HttpOnly/);
      expect(cookies.get(REFRESH_COOKIE)!.line).toMatch(/HttpOnly/);
      expect(await state.ctx.googleSubjects(email)).toEqual(["sub-existente"]);
      expect(await state.ctx.countSessions(email)).toBe(1);

      const me = await http()
        .get("/api/auth/me")
        .set(
          "Cookie",
          cookieHeader({ [ACCESS_COOKIE]: cookies.get(ACCESS_COOKIE)!.value }),
        );
      expect(me.status).toBe(200);
      expect(me.body.email).toBe(email);

      // La segunda vez entra por la cuenta vinculada (el sub), sin duplicar el vínculo, aunque el
      // email de Google haya cambiado.
      const again = await loginWith({
        email: "otro-email@kaname.test",
        sub: "sub-existente",
      });
      expect(again.headers.location).toBe("/");
      expect(cookiesOf(again).has(ACCESS_COOKIE)).toBe(true);
      expect(await state.ctx.googleSubjects(email)).toEqual(["sub-existente"]);
      expect(await state.ctx.userExists("otro-email@kaname.test")).toBe(false);
      // La contraseña sigue funcionando.
      const login = await http()
        .post("/api/auth/login")
        .set(fromIp("198.19.2.1"))
        .send({ email, password: PASSWORD });
      expect(login.status).toBe(200);
    });

    it("usuario inexistente con el registro cerrado: error traducible y no se crea el usuario", async () => {
      const email = `nadie-${Date.now()}@kaname.test`;
      const response = await loginWith({ email });
      expect(response.status).toBe(302);
      expect(response.headers.location).toBe(
        errorRedirect(ErrorCode.googleRegistrationClosed),
      );
      expectNoSession(response);
      expect(await state.ctx.userExists(email)).toBe(false);
    });

    it("id_token inválido (nonce, audiencia, emisor o vencido): se rechaza", async () => {
      const email = await state.ctx.createUser(PASSWORD);
      const invalid = [
        { nonce: "otro-nonce" },
        { aud: "otro-cliente.apps.googleusercontent.com" },
        { iss: "https://evil.example" },
        { exp: Math.floor(Date.now() / 1000) - 10 },
      ];
      for (const extra of invalid) {
        const response = await loginWith({ email, ...extra });
        expect(response.headers.location).toBe(
          errorRedirect(ErrorCode.oauthFailed),
        );
        expectNoSession(response);
      }
      expect(await state.ctx.googleSubjects(email)).toEqual([]);
    });

    it("cancelado en Google o canje rechazado: error genérico", async () => {
      const cancelled = await start();
      const denied = await callback(cancelled, {
        error: "access_denied",
        state: cancelled.state,
      });
      expect(denied.headers.location).toBe(
        errorRedirect(ErrorCode.oauthFailed),
      );

      const rejected = await start();
      const failed = await callback(rejected, {
        code: "codigo-desconocido",
        state: rejected.state,
      });
      expect(failed.headers.location).toBe(
        errorRedirect(ErrorCode.oauthFailed),
      );
      expectNoSession(failed);
    });

    it("destino: el error vuelve al login y un destino externo se descarta", async () => {
      const email = `nadie-${Date.now()}@kaname.test`;
      const closed = await loginWith({ email });
      expect(closed.headers.location).toBe(
        errorRedirect(ErrorCode.googleRegistrationClosed),
      );

      const existing = await state.ctx.createUser(PASSWORD);
      const external = await loginWith(
        { email: existing },
        { next: "//evil.example" },
      );
      expect(external.headers.location).toBe("/");
    });

    it("options: informa que el login con Google está activo", async () => {
      const response = await http().get("/api/auth/options");
      expect(response.body.googleEnabled).toBe(true);
    });
  });
}

/** Con el registro abierto (ver src/auth/register.spec.ts): Google crea el usuario. */
export function googleRegisterTests(name: string, context: () => TestContext) {
  describe(name, () => {
    const { state, http, loginWith } = useGoogleApp(context);

    it("usuario inexistente: se crea sin contraseña, vinculado a Google, con la sesión iniciada", async () => {
      const email = `google-nuevo-${Date.now()}@kaname.test`;
      state.ctx.trackEmail(email);
      const response = await loginWith({
        email,
        sub: "sub-nuevo",
        name: "Nueva Persona",
      });
      expect(response.headers.location).toBe("/");
      const access = cookiesOf(response).get(ACCESS_COOKIE)!.value;
      const me = await http()
        .get("/api/auth/me")
        .set("Cookie", cookieHeader({ [ACCESS_COOKIE]: access }));
      expect(me.body).toMatchObject({ email, name: "Nueva Persona" });
      expect(await state.ctx.googleSubjects(email)).toEqual(["sub-nuevo"]);

      // Sin contraseña: el login con contraseña no entra.
      const login = await http()
        .post("/api/auth/login")
        .set(fromIp("198.19.3.1"))
        .send({ email, password: PASSWORD });
      expect(login.status).toBe(401);
    });
  });
}
