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
});
