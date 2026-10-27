import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import type { App } from "supertest/types.js";
import { createTestApp } from "./support/create-app.js";

describe("GET /api/health (e2e)", () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it("responde 200 con { ok: true } bajo el prefijo /api", async () => {
    await request(app.getHttpServer())
      .get("/api/health")
      .expect(200)
      .expect({ ok: true });
    await request(app.getHttpServer()).get("/health").expect(404);
  });

  it("manda los headers de seguridad (helmet)", async () => {
    const response = await request(app.getHttpServer()).get("/api/health");
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["strict-transport-security"]).toMatch(/max-age=/);
    expect(response.headers["content-security-policy"]).toBe(
      "default-src 'none';frame-ancestors 'none'",
    );
    expect(response.headers["x-frame-options"]).toBe("DENY");
    expect(response.headers["x-powered-by"]).toBeUndefined();
  });
});
