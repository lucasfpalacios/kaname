import { CLIENT_IP_HEADER, PROXY_SECRET_HEADER } from "@kaname/shared";
import { type NextRequest, NextResponse } from "next/server";
import {
  ACCESS_COOKIE,
  nestUrl,
  GUEST_PATHS,
  OPEN_PATHS,
  REFRESH_COOKIE,
} from "./lib/auth/constants";
import { clientIp, clientIpHeaders } from "./lib/auth/client-ip";
import { safeNextPath } from "./lib/auth/next-path";
import { refreshSession } from "./lib/auth/server-refresh";
import { isAccessFresh, parseSetCookie } from "./lib/auth/tokens";
import { isLocale, LOCALE_COOKIE, type Locale } from "./i18n/locale";

// Proxy de Next (antes "middleware"). Hace cuatro cosas:
// 1. /api/*: deja pasar el pedido a la API (el rewrite está en next.config.ts) con la IP real
//    del cliente en un header propio y el secreto compartido (lib/auth/client-ip.ts), así la API
//    no confía en nada que mande el cliente.
// 2. Sesión: si el access está por vencer y hay refresh, la renueva acá (un solo refresh por
//    token, ver lib/auth/server-refresh.ts). Las cookies nuevas van al navegador y también al
//    render de este mismo pedido.
// 3. Rutas: sin sesión, todo lo que no sea /login o /register va a /login?next=...; con sesión,
//    /login vuelve al destino. /forgot-password y /reset-password se abren siempre.
// 4. URLs viejas con el idioma (/en/...): redirigen a la misma ruta sin prefijo. El idioma ya no va
//    en la URL (sale de la cookie, ver i18n/request.ts); si no había cookie, el de la URL vieja
//    queda guardado.

type Session =
  | { kind: "active" }
  | { kind: "refreshed"; setCookies: string[] }
  | { kind: "none"; clear: boolean };

export default async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname === "/api" || pathname.startsWith("/api/")) {
    return forwardToApi(request);
  }

  const legacy = legacyLocale(pathname);
  if (legacy) return redirectLegacy(request, legacy);

  // Recuperación de contraseña: sin sesión y sin redirigir; no hace falta renovar nada.
  if (OPEN_PATHS.includes(pathname)) {
    const response = NextResponse.next();
    // El link trae el token en la URL: ningún pedido de esa página (ni las fuentes que se
    // precargan antes de la meta) lo manda como Referer. El header aplica desde el primer byte.
    if (pathname === "/reset-password") {
      response.headers.set("Referrer-Policy", "no-referrer");
    }
    return response;
  }

  const isPublic = GUEST_PATHS.includes(pathname);
  const session = await resolveSession(request, { verify: isPublic });

  if (isPublic) {
    if (session.kind === "none")
      return withSession(NextResponse.next(), session);
    const next = safeNextPath(request.nextUrl.searchParams.get("next"), "/");
    return withSession(
      NextResponse.redirect(new URL(next, request.url)),
      session,
    );
  }

  if (session.kind === "none") {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname + search);
    return withSession(NextResponse.redirect(login), session);
  }
  return withSession(NextResponse.next(), session);
}

function redirectLegacy(request: NextRequest, locale: Locale) {
  const url = request.nextUrl.clone();
  url.pathname = url.pathname.slice(locale.length + 1) || "/";
  const response = NextResponse.redirect(url, 308);
  if (!request.cookies.has(LOCALE_COOKIE)) {
    response.cookies.set({
      name: LOCALE_COOKIE,
      value: locale,
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }
  return response;
}

function forwardToApi(request: NextRequest) {
  const headers = new Headers(request.headers);
  // Lo que mande el cliente en estos headers nunca llega a la API.
  headers.delete(CLIENT_IP_HEADER);
  headers.delete(PROXY_SECRET_HEADER);
  for (const [name, value] of Object.entries(
    clientIpHeaders(clientIp(request.headers)),
  )) {
    headers.set(name, value);
  }
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
        ...clientIpHeaders(ip),
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

/**
 * Idioma del primer segmento de una URL vieja ("/en/w/tank" → "en"); null si no tiene. Antes el
 * inglés iba con /en (y /es también llegaba a español).
 */
function legacyLocale(pathname: string): Locale | null {
  const segment = pathname.split("/")[1];
  return isLocale(segment) ? segment : null;
}

export const config = {
  // Todo menos los internos de Next y los archivos con extensión. /api entra (para la IP).
  matcher: "/((?!_next|_vercel|.*\\..*).*)",
};
