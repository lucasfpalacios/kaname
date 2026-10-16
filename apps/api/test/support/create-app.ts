import type { INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { Test } from "@nestjs/testing";
import type { App } from "supertest/types.js";
import { AppModule } from "../../src/app.module.js";
import { configureApp } from "../../src/app.setup.js";
import type { Env } from "../../src/config/env.js";
import { PrismaService } from "../../src/prisma/prisma.service.js";

/** La misma app que main.ts, con un Prisma opcional en lugar del real. */
export async function createTestApp(
  prisma?: unknown,
): Promise<INestApplication<App>> {
  let builder = Test.createTestingModule({ imports: [AppModule] });
  if (prisma)
    builder = builder.overrideProvider(PrismaService).useValue(prisma);
  const moduleRef = await builder.compile();
  const app = moduleRef.createNestApplication<NestExpressApplication>();
  configureApp(app, app.get<ConfigService<Env, true>>(ConfigService));
  await app.init();
  return app as unknown as INestApplication<App>;
}
