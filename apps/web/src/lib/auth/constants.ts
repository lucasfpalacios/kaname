// Cookies de sesión que pone la API (apps/api/src/auth/cookies.ts). Las dos son httpOnly: el
// JavaScript del navegador no las ve; las leen el proxy de Next y los Server Components.
export const ACCESS_COOKIE = "kaname_access";
export const REFRESH_COOKIE = "kaname_refresh";

/** Rutas para quien no tiene sesión: con sesión, vuelven al inicio (sin el prefijo de idioma). */
export const GUEST_PATHS = ["/login", "/register"];

/** Rutas abiertas con o sin sesión: el link de recuperación sirve aunque haya una sesión abierta. */
export const OPEN_PATHS = ["/forgot-password", "/reset-password"];

/** Si al access le queda menos que esto, se renueva antes de usarlo. */
export const REFRESH_SKEW_SECONDS = 30;

/** La API (Nest). Solo en el servidor: el navegador usa /api/* del mismo origen. */
export const nestUrl = () =>
  (process.env.NEST_URL ?? "http://localhost:4000").replace(/\/$/, "");
