import type { CookieOptions, Response } from "express";
import {
  ACCESS_COOKIE,
  clearAuthCookies,
  REFRESH_COOKIE,
  setAuthCookies,
} from "./cookies.js";

function fakeResponse() {
  const set: Record<string, CookieOptions> = {};
  const cleared: Record<string, CookieOptions> = {};
  const res = {
    cookie: (name: string, _value: string, options: CookieOptions) => {
      set[name] = options;
    },
    clearCookie: (name: string, options: CookieOptions) => {
      cleared[name] = options;
    },
  } as unknown as Response;
  return { res, set, cleared };
}

describe("cookies de auth", () => {
  const tokens = { accessToken: "a", refreshToken: "r" };

  it("son Secure en producción", () => {
    const { res, set, cleared } = fakeResponse();
    setAuthCookies(res, tokens, true);
    clearAuthCookies(res, true);
    for (const name of [ACCESS_COOKIE, REFRESH_COOKIE]) {
      expect(set[name]).toMatchObject({
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      });
      expect(cleared[name]).toMatchObject({ secure: true });
    }
  });

  it("no son Secure en desarrollo (http://localhost)", () => {
    const { res, set } = fakeResponse();
    setAuthCookies(res, tokens, false);
    expect(set[ACCESS_COOKIE]).toMatchObject({ secure: false, path: "/" });
    expect(set[REFRESH_COOKIE]).toMatchObject({
      secure: false,
      path: "/api/auth",
    });
  });
});
