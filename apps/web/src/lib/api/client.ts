// Cliente de la API para el navegador: llama a /api/* (mismo origen, Next reenvía a Nest) con
// las cookies de sesión. Si un pedido vuelve con 401 porque venció el access, renueva la sesión
// con el refresh y lo reintenta una vez. Los refresh no corren en paralelo: si varios pedidos
// vencen a la vez, comparten el mismo refresh. Si el refresh falla, avisa (va a /login).

// Estos endpoints manejan su propio 401 (credenciales incorrectas, refresh vencido): no se
// reintentan con un refresh.
const NO_RETRY = new Set([
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api/auth/logout",
]);

type ApiClientOptions = {
  fetch?: typeof fetch;
  /** Se llama una sola vez cuando la sesión ya no se puede renovar. */
  onSessionExpired: () => void;
};

export function createApiClient({
  fetch: fetchImpl = (...args) => fetch(...args),
  onSessionExpired,
}: ApiClientOptions) {
  let refreshing: Promise<boolean> | null = null;
  let expired = false;

  function refreshOnce(): Promise<boolean> {
    refreshing ??= fetchImpl("/api/auth/refresh", {
      method: "POST",
      credentials: "same-origin",
    })
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => {
        refreshing = null;
      });
    return refreshing;
  }

  async function apiFetch(path: string, init: RequestInit = {}) {
    const request = () =>
      fetchImpl(path, { ...init, credentials: "same-origin" });
    const response = await request();
    if (response.status !== 401 || NO_RETRY.has(path.split("?")[0])) {
      return response;
    }
    if (await refreshOnce()) return request();
    if (!expired) {
      expired = true;
      onSessionExpired();
    }
    return response;
  }

  return { apiFetch, refreshOnce };
}
