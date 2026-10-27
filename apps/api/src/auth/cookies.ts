import type { CookieOptions, Response } from "express";

// Los dos tokens viajan en cookies httpOnly (el JavaScript de la web no los ve), SameSite=Lax y
// Secure en producción, con Path=/. El refresh también va en Path=/ para que el proxy de Next
// (apps/web/src/proxy.ts) lo vea en la navegación y renueve la sesión del lado del servidor
// cuando vence el access.
export const ACCESS_COOKIE = "kaname_access";
export const REFRESH_COOKIE = "kaname_refresh";

/** Por defecto; se cambia con ACCESS_TOKEN_TTL_SECONDS. */
export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;

export type CookieSettings = {
  /** Secure (solo HTTPS): en producción. */
  secure: boolean;
  /** Vida del access token, igual que la del JWT. */
  accessTtlSeconds: number;
};

const baseOptions = (secure: boolean): CookieOptions => ({
  httpOnly: true,
  secure,
  sameSite: "lax",
  path: "/",
});

export function setAuthCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
  settings: CookieSettings,
) {
  res.cookie(ACCESS_COOKIE, tokens.accessToken, {
    ...baseOptions(settings.secure),
    maxAge: settings.accessTtlSeconds * 1000,
  });
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, {
    ...baseOptions(settings.secure),
    maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000,
  });
}

export function clearAuthCookies(res: Response, settings: CookieSettings) {
  res.clearCookie(ACCESS_COOKIE, baseOptions(settings.secure));
  res.clearCookie(REFRESH_COOKIE, baseOptions(settings.secure));
}
