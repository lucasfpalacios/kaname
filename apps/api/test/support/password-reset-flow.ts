import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import type { App } from "supertest/types.js";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "../../src/auth/cookies.js";
import type { AuthFlowContext } from "./auth-flow.js";
import { cookieHeader, cookiesOf } from "./auth-flow.js";
import { type MailRecorder, resetTokenOf } from "./mail-recorder.js";

// Recuperación de contraseña por HTTP, en memoria (src/auth/password-reset.spec.ts) y contra
// Postgres (test/password-reset.e2e-spec.ts).

type Context = AuthFlowContext & { mail: MailRecorder };

const PASSWORD = "contraseña vieja y larga";
const NEW_PASSWORD = "contraseña nueva y larga";

export function passwordResetTests(name: string, context: () => Context) {
  describe(name, () => {
    let app: INestApplication<App>;
    let ctx: Context;
    let ip = 0;

    beforeEach(async () => {
      ctx = context();
      app = await ctx.createApp();
    });

    afterEach(async () => {
      await app.close();
      await ctx.cleanup();
    });

    // Cada pedido desde otra IP (TRUST_PROXY=1), salvo en el test del rate limit.
    const nextIp = () => `198.18.0.${++ip}`;
    const http = () => request(app.getHttpServer());
    const forgot = (email: string, from = nextIp()) =>
      http()
        .post("/api/auth/forgot-password")
        .set("X-Forwarded-For", from)
        .send({ email });
    const reset = (token: string, password = NEW_PASSWORD) =>
      http()
        .post("/api/auth/reset-password")
        .set("X-Forwarded-For", nextIp())
        .send({ token, password });
    const login = (email: string, password: string) =>
      http()
        .post("/api/auth/login")
        .set("X-Forwarded-For", nextIp())
        .send({ email, password });

    async function requestToken(email: string) {
      const mail = ctx.mail.next(email);
      expect((await forgot(email)).status).toBe(202);
      return resetTokenOf(await mail);
    }

    it("email inexistente: la misma respuesta y no se manda nada", async () => {
      const email = await ctx.createUser(PASSWORD);
      const sent = ctx.mail.next(email);
      const existing = await forgot(email);
      const missing = await forgot("nadie@kaname.test");
      expect(missing.status).toBe(202);
      expect(missing.status).toBe(existing.status);
      expect(missing.body).toEqual(existing.body);
      await sent;
      // forgot-password trabaja en segundo plano: se le da tiempo antes de mirar los envíos.
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(ctx.mail.sent.map((mail) => mail.to)).toEqual([email]);
    });

    it("email existente: link de un solo uso con el logo y en el idioma del usuario", async () => {
      const es = await ctx.createUser(PASSWORD, "es");
      const en = await ctx.createUser(PASSWORD, "en");
      const esMail = ctx.mail.next(es);
      const enMail = ctx.mail.next(en);
      await forgot(es);
      await forgot(en);

      const spanish = await esMail;
      expect(spanish.subject).toBe("Restablecé tu contraseña de Kaname");
      expect(spanish.text).toMatch(
        /http:\/\/localhost:3000\/reset-password\?token=/,
      );
      expect(spanish.html).toContain("要");
      expect(spanish.html).toContain("Kaname");
      expect(spanish.text).toMatch(/30 minutos/);

      const english = await enMail;
      expect(english.subject).toBe("Reset your Kaname password");
      expect(english.text).toMatch(
        /localhost:3000\/en\/reset-password\?token=/,
      );
    });

    it("token vencido: 400 y la contraseña sigue igual", async () => {
      const email = await ctx.createUser(PASSWORD);
      const token = await requestToken(email);
      await ctx.expireResetTokens(email);

      const response = await reset(token);
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("reset_token_invalid");
      expect((await login(email, PASSWORD)).status).toBe(200);
    });

    it("token ya usado: 400 la segunda vez", async () => {
      const email = await ctx.createUser(PASSWORD);
      const token = await requestToken(email);
      expect((await reset(token)).status).toBe(204);

      const again = await reset(token, "otra contraseña larga");
      expect(again.status).toBe(400);
      expect(again.body.message).toBe("reset_token_invalid");
      expect((await login(email, NEW_PASSWORD)).status).toBe(200);
    });

    it("token inventado: 400", async () => {
      expect((await reset("no-es-un-token")).body.message).toBe(
        "reset_token_invalid",
      );
    });

    it("cambio correcto: guarda la contraseña nueva y cierra todas las sesiones", async () => {
      const email = await ctx.createUser(PASSWORD);
      const laptop = await login(email, PASSWORD);
      const phone = await login(email, PASSWORD);
      expect(await ctx.countSessions(email)).toBe(2);
      const token = await requestToken(email);

      const response = await reset(token);
      expect(response.status).toBe(204);
      expect(cookiesOf(response).get(ACCESS_COOKIE)?.line).toMatch(
        /Expires=Thu, 01 Jan 1970/,
      );

      expect(await ctx.countSessions(email)).toBe(0);
      for (const session of [laptop, phone]) {
        const cookies = cookiesOf(session);
        const refresh = await http()
          .post("/api/auth/refresh")
          .set(
            "Cookie",
            cookieHeader({
              [REFRESH_COOKIE]: cookies.get(REFRESH_COOKIE)!.value,
            }),
          );
        expect(refresh.status).toBe(401);
        const me = await http()
          .get("/api/auth/me")
          .set(
            "Cookie",
            cookieHeader({
              [ACCESS_COOKIE]: cookies.get(ACCESS_COOKIE)!.value,
            }),
          );
        expect(me.status).toBe(401);
      }
      expect((await login(email, PASSWORD)).status).toBe(401);
      expect((await login(email, NEW_PASSWORD)).status).toBe(200);
    });

    it("pedir otro link invalida el anterior", async () => {
      const email = await ctx.createUser(PASSWORD);
      const first = await requestToken(email);
      const second = await requestToken(email);
      expect((await reset(first)).status).toBe(400);
      expect((await reset(second)).status).toBe(204);
    });

    it("contraseña nueva corta: 400 con el código de validación", async () => {
      const email = await ctx.createUser(PASSWORD);
      const token = await requestToken(email);
      const response = await reset(token, "corta");
      expect(response.status).toBe(400);
      expect(response.body.issues).toEqual([
        { path: "password", code: "password_too_short" },
      ]);
    });

    it("rate limit: forgot-password y reset-password responden 429 al sexto intento por IP", async () => {
      const from = "198.18.1.1";
      for (let attempt = 0; attempt < 5; attempt++) {
        expect((await forgot(`x${attempt}@kaname.test`, from)).status).toBe(
          202,
        );
      }
      expect((await forgot("x9@kaname.test", from)).status).toBe(429);

      const resets = () =>
        http()
          .post("/api/auth/reset-password")
          .set("X-Forwarded-For", "198.18.2.1")
          .send({ token: "no-es-un-token", password: NEW_PASSWORD });
      for (let attempt = 0; attempt < 5; attempt++) {
        expect((await resets()).status).toBe(400);
      }
      expect((await resets()).status).toBe(429);
    });
  });
}
