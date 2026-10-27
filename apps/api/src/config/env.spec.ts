import { Logger } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import { MailService } from "../mail/mail.service.js";
import { type Env, validateEnv } from "./env.js";

const base = {
  DATABASE_URL: "postgresql://test:test@localhost:5434/test",
  WEB_ORIGIN: "http://localhost:3000",
  JWT_ACCESS_SECRET: "secreto-de-prueba-de-al-menos-32-caracteres",
};

const production = {
  ...base,
  NODE_ENV: "production",
  RESEND_API_KEY: "re_prueba",
  PROXY_SHARED_SECRET: "secreto-del-proxy-de-prueba-de-32-caracteres",
};

describe("validateEnv", () => {
  it("sin NODE_ENV no arranca", () => {
    expect(() => validateEnv(base)).toThrow(/NODE_ENV/);
  });

  it("producción exige Resend y el secreto del proxy", () => {
    expect(validateEnv(production).NODE_ENV).toBe("production");
    expect(() => validateEnv({ ...production, RESEND_API_KEY: "" })).toThrow(
      /RESEND_API_KEY/,
    );
    expect(() =>
      validateEnv({ ...production, PROXY_SHARED_SECRET: undefined }),
    ).toThrow(/PROXY_SHARED_SECRET/);
  });

  it("DEV_LOG_RESET_LINKS no se puede usar en producción", () => {
    expect(() =>
      validateEnv({ ...production, DEV_LOG_RESET_LINKS: "true" }),
    ).toThrow(/DEV_LOG_RESET_LINKS/);
    expect(
      validateEnv({
        ...base,
        NODE_ENV: "development",
        DEV_LOG_RESET_LINKS: "true",
      }).DEV_LOG_RESET_LINKS,
    ).toBe(true);
  });
});

describe("MailService sin Resend", () => {
  const mail = {
    to: "lucas@kaname.test",
    subject: "Restablecé tu contraseña",
    html: "<p>link</p>",
    text: "https://kaname.test/reset-password?token=secreto",
  };

  function logged(devLog: boolean) {
    const config = {
      get: (key: keyof Env) =>
        key === "DEV_LOG_RESET_LINKS" ? devLog : undefined,
    } as unknown as ConfigService<Env, true>;
    const log = vi.spyOn(Logger.prototype, "log").mockImplementation(() => {});
    return new MailService(config)
      .send(mail)
      .then(() => log.mock.calls.map(([message]) => String(message)).join())
      .finally(() => log.mockRestore());
  }

  it("no escribe el link en el log", async () => {
    const output = await logged(false);
    expect(output).toContain(mail.to);
    expect(output).not.toContain("token=");
  });

  it("con DEV_LOG_RESET_LINKS=true escribe el email entero", async () => {
    expect(await logged(true)).toContain("token=secreto");
  });
});
