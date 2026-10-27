// Cookies de sesión que pone la API (apps/api/src/auth/cookies.ts). Las dos son httpOnly: el
// JavaScript del navegador no las ve; las leen el proxy de Next y los Server Components.
export const ACCESS_COOKIE = "kaname_access";
export const REFRESH_COOKIE = "kaname_refresh";

/** Rutas a las que se entra sin sesión (sin el prefijo de idioma). */
export const PUBLIC_PATHS = ["/login", "/register"];

/** Si al access le queda menos que esto, se renueva antes de usarlo. */
export const REFRESH_SKEW_SECONDS = 30;

/** La API (Nest). Solo en el servidor: el navegador usa /api/* del mismo origen. */
export const nestUrl = () =>
  (process.env.NEST_URL ?? "http://localhost:4000").replace(/\/$/, "");
