import type { CookieOptions, Response } from "express";
import { API_PREFIX } from "../config/http.js";

// Los dos tokens viajan en cookies httpOnly (el JavaScript de la web no los ve), SameSite=Lax y
// Secure en producción. El refresh solo se manda a /api/auth, que es donde se usa.
export const ACCESS_COOKIE = "kaname_access";
export const REFRESH_COOKIE = "kaname_refresh";

export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;

function baseOptions(secure: boolean): CookieOptions {
  return { httpOnly: true, secure, sameSite: "lax" };
}

const accessOptions = (secure: boolean): CookieOptions => ({
  ...baseOptions(secure),
  path: "/",
});

const refreshOptions = (secure: boolean): CookieOptions => ({
  ...baseOptions(secure),
  path: `/${API_PREFIX}/auth`,
});

export function setAuthCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
  secure: boolean,
) {
  res.cookie(ACCESS_COOKIE, tokens.accessToken, {
    ...accessOptions(secure),
    maxAge: ACCESS_TOKEN_TTL_SECONDS * 1000,
  });
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, {
    ...refreshOptions(secure),
    maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000,
  });
}

export function clearAuthCookies(res: Response, secure: boolean) {
  res.clearCookie(ACCESS_COOKIE, accessOptions(secure));
  res.clearCookie(REFRESH_COOKIE, refreshOptions(secure));
}
