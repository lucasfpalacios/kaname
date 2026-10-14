import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Orígenes permitidos separados por coma (producción + previews). Falla al arrancar si falta.
  const origins = config
    .getOrThrow<string>("WEB_ORIGIN")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);
  app.enableCors({ origin: origins });

  // Cierra Prisma (onModuleDestroy) cuando la plataforma manda SIGTERM.
  app.enableShutdownHooks();

  await app.listen(config.get<string>("PORT") ?? 4000);
}
await bootstrap();
