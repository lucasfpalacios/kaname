import { describe, expect, it } from "vitest";
import { loginPath } from "./login-path";
import { safeNextPath } from "./next-path";
import { accessTokenExpiry, isAccessFresh, parseSetCookie } from "./tokens";

const jwt = (payload: object) =>
  `x.${Buffer.from(JSON.stringify(payload)).toString("base64url")}.firma`;

describe("safeNextPath", () => {
  it("acepta rutas del mismo sitio", () => {
    expect(safeNextPath("/ui-kit?tab=1")).toBe("/ui-kit?tab=1");
    expect(safeNextPath("/en/ui-kit")).toBe("/en/ui-kit");
  });

  it("rechaza destinos en otro dominio (open redirect)", () => {
    for (const value of [
      "https://evil.test",
      "//evil.test",
      "/\\evil.test",
      "evil",
      "",
    ]) {
      expect(safeNextPath(value, "/inicio")).toBe("/inicio");
    }
    expect(safeNextPath(null)).toBe("/");
  });
});

describe("access token", () => {
  it("lee el vencimiento del JWT sin verificarlo", () => {
    expect(accessTokenExpiry(jwt({ exp: 1_000 }))).toBe(1_000_000);
    expect(accessTokenExpiry("no-es-un-jwt")).toBeNull();
    expect(accessTokenExpiry(undefined)).toBeNull();
  });

  it("lo considera vigente solo si le quedan más de 30 s", () => {
    const now = 1_000_000;
    expect(isAccessFresh(jwt({ exp: now / 1000 + 60 }), now)).toBe(true);
    expect(isAccessFresh(jwt({ exp: now / 1000 + 10 }), now)).toBe(false);
    expect(isAccessFresh(undefined, now)).toBe(false);
  });
});

describe("parseSetCookie", () => {
  it("conserva los atributos de la cookie de la API", () => {
    const cookie = parseSetCookie(
      "kaname_refresh=abc.def; Max-Age=2592000; Path=/; Expires=Sun, 15 Nov 2026 10:00:00 GMT; HttpOnly; Secure; SameSite=Lax",
    );
    expect(cookie).toMatchObject({
      name: "kaname_refresh",
      value: "abc.def",
      maxAge: 2592000,
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
  });

  it("ignora líneas inválidas", () => {
    expect(parseSetCookie("sin-igual")).toBeNull();
  });
});

describe("loginPath", () => {
  it("sin idioma en la URL, con el destino codificado", () => {
    expect(loginPath()).toBe("/login");
    expect(loginPath("/w/tank?x=1")).toBe("/login?next=%2Fw%2Ftank%3Fx%3D1");
  });
});
