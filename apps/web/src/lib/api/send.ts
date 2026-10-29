import { apiFetch } from "./browser";
import { type ApiError, readApiError } from "./errors";

// Pedidos a la API desde el navegador que devuelven el resultado sin tirar: o los datos, o el
// error de la API (código traducible e issues por campo).
export type Result<T> = { ok: true; data: T } | { ok: false; error: ApiError };

export async function send<T>(path: string, method: string, body?: unknown) {
  try {
    const response = await apiFetch(path, {
      method,
      headers: body ? { "content-type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
      return { ok: false, error: await readApiError(response) } as Result<T>;
    }
    const data = response.status === 204 ? undefined : await response.json();
    return { ok: true, data: data as T } as Result<T>;
  } catch {
    return { ok: false, error: { code: "unknown", issues: [] } } as Result<T>;
  }
}

/** Para las queries de TanStack Query: los datos, o tira el ApiError (la query queda en error). */
export async function getJson<T>(path: string): Promise<T> {
  const result = await send<T>(path, "GET");
  if (!result.ok) throw result.error;
  return result.data;
}
