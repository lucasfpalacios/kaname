import { Test, TestingModule } from "@nestjs/testing";
import { HealthController } from "./health.controller.js";

describe("HealthController", () => {
  let healthController: HealthController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    healthController = app.get<HealthController>(HealthController);
  });

  it("devuelve { ok: true }", () => {
    expect(healthController.check()).toEqual({ ok: true });
  });
});
