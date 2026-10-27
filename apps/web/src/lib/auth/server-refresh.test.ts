import { beforeEach, describe, expect, it, vi } from "vitest";
import { refreshSession, resetRefreshCache } from "./server-refresh";

function fakeFetch(status: number, delayMs = 20) {
  return vi.fn(
    () =>
      new Promise<Response>((resolve) =>
        setTimeout(() => {
          const headers = new Headers();
          if (status === 204) {
            headers.append(
              "set-cookie",
              "kaname_access=nuevo; Path=/; HttpOnly",
            );
            headers.append(
              "set-cookie",
              "kaname_refresh=s1.nuevo; Path=/; HttpOnly",
            );
          }
          resolve(new Response(null, { status, headers }));
        }, delayMs),
      ),
  ) as unknown as typeof fetch & ReturnType<typeof vi.fn>;
}

describe("refreshSession (proxy de Next)", () => {
  beforeEach(() => resetRefreshCache());

  it("hace un solo refresh aunque lleguen varios pedidos a la vez con el mismo token", async () => {
    const fetchImpl = fakeFetch(204);
    const results = await Promise.all(
      Array.from({ length: 5 }, () =>
        refreshSession("s1.viejo", {}, fetchImpl),
      ),
    );
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    for (const result of results) {
      expect(result).toEqual({
        ok: true,
        setCookies: [
          "kaname_access=nuevo; Path=/; HttpOnly",
          "kaname_refresh=s1.nuevo; Path=/; HttpOnly",
        ],
      });
    }
  });

  it("un pedido que llega después con el mismo token recibe el mismo resultado", async () => {
    const fetchImpl = fakeFetch(204);
    await refreshSession("s1.viejo", {}, fetchImpl);
    await refreshSession("s1.viejo", {}, fetchImpl);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("tokens distintos no comparten el refresh", async () => {
    const fetchImpl = fakeFetch(204);
    await Promise.all([
      refreshSession("s1.a", {}, fetchImpl),
      refreshSession("s2.b", {}, fetchImpl),
    ]);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("reenvía la IP del cliente y devuelve el status si falla", async () => {
    const fetchImpl = fakeFetch(401);
    const result = await refreshSession(
      "s1.revocado",
      { ip: "203.0.113.10", userAgent: "Chrome" },
      fetchImpl,
    );
    expect(result).toEqual({ ok: false, status: 401 });
    const [, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(init.headers).toMatchObject({
      "x-forwarded-for": "203.0.113.10",
      "user-agent": "Chrome",
    });
  });
});
