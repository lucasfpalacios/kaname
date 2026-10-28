import { Test, TestingModule } from "@nestjs/testing";
import type { Response } from "express";
import { PrismaService } from "../prisma/prisma.service.js";
import { HealthController } from "./health.controller.js";

describe("HealthController", () => {
  const prisma = { isReachable: vi.fn<() => Promise<boolean>>() };
  const res = { status: vi.fn() };
  let healthController: HealthController;

  beforeEach(async () => {
    res.status.mockReset();
    const app: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: PrismaService, useValue: prisma }],
    }).compile();

    healthController = app.get<HealthController>(HealthController);
  });

  it("con la base arriba: { ok: true, database: 'up' }", async () => {
    prisma.isReachable.mockResolvedValue(true);
    expect(await healthController.check(res as unknown as Response)).toEqual({
      ok: true,
      database: "up",
    });
    expect(res.status).not.toHaveBeenCalled();
  });

  it("sin base: 503 con { ok: false, database: 'down' }", async () => {
    prisma.isReachable.mockResolvedValue(false);
    expect(await healthController.check(res as unknown as Response)).toEqual({
      ok: false,
      database: "down",
    });
    expect(res.status).toHaveBeenCalledWith(503);
  });
});
