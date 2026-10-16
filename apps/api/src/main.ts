import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module.js";
import { configureApp } from "./app.setup.js";
import type { Env } from "./config/env.js";

async function bootstrap() {
  // Las variables de entorno se validan al crear el módulo: si falta algo, no arranca.
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get<ConfigService<Env, true>>(ConfigService);
  configureApp(app, config);

  // Cierra Prisma (onModuleDestroy) cuando la plataforma manda SIGTERM.
  app.enableShutdownHooks();

  await app.listen(config.get("PORT", { infer: true }));
}
await bootstrap();
