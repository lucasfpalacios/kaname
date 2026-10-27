import { describe, expect, it, vi } from "vitest";
import { createApiClient } from "./client";

type Handler = (path: string) => Response;

function fakeFetch(handler: Handler) {
  return vi.fn(async (path: string) => {
    await new Promise((resolve) => setTimeout(resolve, 10));
    return handler(path);
  }) as unknown as typeof fetch & ReturnType<typeof vi.fn>;
}

const calls = (fetchImpl: ReturnType<typeof vi.fn>, path: string) =>
  fetchImpl.mock.calls.filter(([url]) => url === path).length;

describe("createApiClient (navegador)", () => {
  it("con varios 401 a la vez hace un solo refresh y reintenta cada pedido", async () => {
    let refreshed = false;
    const fetchImpl = fakeFetch((path) => {
      if (path === "/api/auth/refresh") {
        refreshed = true;
        return new Response(null, { status: 204 });
      }
      return new Response(null, { status: refreshed ? 200 : 401 });
    });
    const onSessionExpired = vi.fn();
    const { apiFetch } = createApiClient({
      fetch: fetchImpl,
      onSessionExpired,
    });

    const responses = await Promise.all([
      apiFetch("/api/auth/me"),
      apiFetch("/api/workspaces"),
      apiFetch("/api/orders"),
    ]);

    expect(responses.map((response) => response.status)).toEqual([
      200, 200, 200,
    ]);
    expect(calls(fetchImpl, "/api/auth/refresh")).toBe(1);
    expect(onSessionExpired).not.toHaveBeenCalled();
  });

  it("si el refresh falla avisa una sola vez (va a /login)", async () => {
    const fetchImpl = fakeFetch(() => new Response(null, { status: 401 }));
    const onSessionExpired = vi.fn();
    const { apiFetch } = createApiClient({
      fetch: fetchImpl,
      onSessionExpired,
    });

    await Promise.all([apiFetch("/api/auth/me"), apiFetch("/api/orders")]);
    expect(calls(fetchImpl, "/api/auth/refresh")).toBe(1);
    expect(onSessionExpired).toHaveBeenCalledTimes(1);
  });

  it("no reintenta el login ni el propio refresh", async () => {
    const fetchImpl = fakeFetch(() => new Response(null, { status: 401 }));
    const { apiFetch } = createApiClient({
      fetch: fetchImpl,
      onSessionExpired: vi.fn(),
    });
    const response = await apiFetch("/api/auth/login", { method: "POST" });
    expect(response.status).toBe(401);
    expect(calls(fetchImpl, "/api/auth/refresh")).toBe(0);
  });
});
