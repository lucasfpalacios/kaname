import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import {
  ACCESS_COOKIE,
  nestUrl,
  GUEST_PATHS,
  OPEN_PATHS,
  REFRESH_COOKIE,
} from "./lib/auth/constants";
import { clientIp } from "./lib/auth/client-ip";
import { safeNextPath } from "./lib/auth/next-path";
import { refreshSession } from "./lib/auth/server-refresh";
import { isAccessFresh, parseSetCookie } from "./lib/auth/tokens";
import { routing, type Locale } from "./i18n/routing";

// Proxy de Next (antes "middleware"). Hace tres cosas:
// 1. /api/*: deja pasar el pedido a la API (el rewrite está en next.config.ts) con la IP real
//    del cliente en X-Forwarded-For, reemplazando la que pudiera mandar el cliente.
// 2. Sesión: si el access está por vencer y hay refresh, la renueva acá (un solo refresh por
//    token, ver lib/auth/server-refresh.ts). Las cookies nuevas van al navegador y también al
//    render de este mismo pedido.
// 3. Rutas: sin sesión, todo lo que no sea /login o /register va a /login?next=...; con sesión,
//    /login vuelve al destino. /forgot-password y /reset-password se abren siempre. Después, el
//    idioma (next-intl).
const intl = createMiddleware(routing);

type Session =
  | { kind: "active" }
  | { kind: "refreshed"; setCookies: string[] }
  | { kind: "none"; clear: boolean };

export default async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname === "/api" || pathname.startsWith("/api/")) {
    return forwardToApi(request);
  }

  const locale = localeOf(pathname);
  const path = stripLocale(pathname, locale);
  // Recuperación de contraseña: sin sesión y sin redirigir; no hace falta renovar nada.
  if (OPEN_PATHS.includes(path)) {
    const response = intl(request);
    // El link trae el token en la URL: ningún pedido de esa página (ni las fuentes que se
    // precargan antes de la meta) lo manda como Referer. El header aplica desde el primer byte.
    if (path === "/reset-password") {
      response.headers.set("Referrer-Policy", "no-referrer");
    }
    return response;
  }

  const isPublic = GUEST_PATHS.includes(path);
  const session = await resolveSession(request, { verify: isPublic });

  if (isPublic) {
    if (session.kind === "none") return withSession(intl(request), session);
    const next = safeNextPath(
      request.nextUrl.searchParams.get("next"),
      localized("/", locale),
    );
    return withSession(
      NextResponse.redirect(new URL(next, request.url)),
      session,
    );
  }

  if (session.kind === "none") {
    const login = new URL(localized("/login", locale), request.url);
    login.searchParams.set("next", pathname + search);
    return withSession(NextResponse.redirect(login), session);
  }
  return withSession(intl(request), session);
}

function forwardToApi(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.delete("x-forwarded-for");
  const ip = clientIp(request.headers);
  if (ip) headers.set("x-forwarded-for", ip);
  return NextResponse.next({ request: { headers } });
}

async function resolveSession(
  request: NextRequest,
  { verify }: { verify: boolean },
): Promise<Session> {
  const access = request.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;
  const forward = {
    ip: clientIp(request.headers),
    userAgent: request.headers.get("user-agent") ?? undefined,
  };

  if (isAccessFresh(access)) {
    // En /login se confirma con la API que la sesión siga viva: un access vigente de una sesión
    // revocada no tiene que mandar al inicio (el inicio lo devolvería a /login: un bucle).
    if (!verify || (await isSessionAlive(access!, forward.ip))) {
      return { kind: "active" };
    }
  }
  if (refresh) {
    const outcome = await refreshSession(refresh, forward);
    if (outcome.ok)
      return { kind: "refreshed", setCookies: outcome.setCookies };
    // 401: el refresh no sirve más, se borran las cookies. Otro error (API caída): se dejan.
    return { kind: "none", clear: outcome.status === 401 };
  }
  return { kind: "none", clear: Boolean(access) };
}

async function isSessionAlive(access: string, ip: string | undefined) {
  try {
    const response = await fetch(`${nestUrl()}/api/auth/me`, {
      headers: {
        cookie: `${ACCESS_COOKIE}=${encodeURIComponent(access)}`,
        ...(ip ? { "x-forwarded-for": ip } : {}),
      },
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Las cookies que se fijan en la respuesta del proxy llegan al navegador y Next también las pasa
// al render de este pedido, así los Server Components ya ven el access renovado.
function withSession(response: NextResponse, session: Session) {
  if (session.kind === "refreshed") {
    for (const line of session.setCookies) {
      const cookie = parseSetCookie(line);
      if (cookie) response.cookies.set(cookie);
    }
  } else if (session.kind === "none" && session.clear) {
    response.cookies.delete({ name: ACCESS_COOKIE, path: "/" });
    response.cookies.delete({ name: REFRESH_COOKIE, path: "/" });
  }
  return response;
}

function localeOf(pathname: string): Locale {
  const segment = pathname.split("/")[1];
  return (
    routing.locales.find((locale) => locale === segment) ??
    routing.defaultLocale
  );
}

function stripLocale(pathname: string, locale: Locale) {
  const prefix = `/${locale}`;
  if (pathname === prefix) return "/";
  return pathname.startsWith(`${prefix}/`)
    ? pathname.slice(prefix.length)
    : pathname;
}

// Español sin prefijo, inglés con /en (localePrefix: "as-needed").
function localized(path: string, locale: Locale) {
  if (locale === routing.defaultLocale) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

export const config = {
  // Todo menos los internos de Next y los archivos con extensión. /api entra (para la IP).
  matcher: "/((?!_next|_vercel|.*\\..*).*)",
};
