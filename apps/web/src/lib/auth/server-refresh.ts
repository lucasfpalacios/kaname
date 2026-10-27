import { createHash } from "node:crypto";
import { clientIpHeaders } from "./client-ip";
import { nestUrl, REFRESH_COOKIE } from "./constants";

export type RefreshOutcome =
  { ok: true; setCookies: string[] } | { ok: false; status: number };

type Forward = { ip?: string; userAgent?: string };

// La API acepta cada refresh token una sola vez (rota en cada uso). Una navegación dispara varios
// pedidos a la vez (la página, los prefetch de los links, los RSC), y todos llegan con el mismo
// refresh vencido. Acá se hace un solo refresh por token: los pedidos que llegan mientras está en
// curso, o hasta 30 s después, reciben el mismo resultado. Es por proceso de Next; si hubiera
// varias instancias, la API tiene su margen de 30 s (responde 401 sin revocar).
const REUSE_MS = 30_000;
const pending = new Map<
  string,
  { result: Promise<RefreshOutcome>; until: number }
>();

const keyOf = (token: string) =>
  createHash("sha256").update(token).digest("hex");

function sweep(now: number) {
  for (const [key, entry] of pending) {
    if (entry.until <= now) pending.delete(key);
  }
}

export function refreshSession(
  refreshToken: string,
  forward: Forward = {},
  fetchImpl: typeof fetch = fetch,
): Promise<RefreshOutcome> {
  const now = Date.now();
  sweep(now);
  const key = keyOf(refreshToken);
  const hit = pending.get(key);
  if (hit) return hit.result;

  const result = callRefresh(refreshToken, forward, fetchImpl);
  pending.set(key, { result, until: now + REUSE_MS });
  // Un error de red no se recuerda: el próximo pedido vuelve a intentar.
  void result.then((outcome) => {
    if (!outcome.ok && outcome.status === 0) pending.delete(key);
  });
  return result;
}

async function callRefresh(
  refreshToken: string,
  { ip, userAgent }: Forward,
  fetchImpl: typeof fetch,
): Promise<RefreshOutcome> {
  try {
    const response = await fetchImpl(`${nestUrl()}/api/auth/refresh`, {
      method: "POST",
      headers: {
        cookie: `${REFRESH_COOKIE}=${encodeURIComponent(refreshToken)}`,
        ...clientIpHeaders(ip),
        ...(userAgent ? { "user-agent": userAgent } : {}),
      },
      cache: "no-store",
      redirect: "manual",
    });
    if (response.status === 204) {
      return { ok: true, setCookies: response.headers.getSetCookie() };
    }
    return { ok: false, status: response.status };
  } catch {
    return { ok: false, status: 0 };
  }
}

/** Para los tests. */
export function resetRefreshCache() {
  pending.clear();
}
