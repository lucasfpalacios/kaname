import type { ConfigService } from "@nestjs/config";
import type { NestExpressApplication } from "@nestjs/platform-express";
import cookieParser from "cookie-parser";
import { clientIpMiddleware } from "./config/client-ip.js";
import type { Env } from "./config/env.js";
import { API_PREFIX } from "./config/http.js";

// Configuración HTTP de la app. La usan main.ts y los tests, así prueban la misma app.
export function configureApp(
  app: NestExpressApplication,
  config: ConfigService<Env, true>,
) {
  app.setGlobalPrefix(API_PREFIX);

  // Los tokens viajan en cookies (ver auth/cookies.ts).
  app.use(cookieParser());

  // IP real del cliente para el rate limit: la que manda Next con el secreto compartido.
  app.use(
    clientIpMiddleware(config.get("PROXY_SHARED_SECRET", { infer: true })),
  );

  // CORS solo entra en juego si la web llama a la API directo desde otro origen (por ejemplo
  // localhost:3000 → localhost:4000 sin el proxy). Con el rewrite de Next los pedidos son del
  // mismo origen. Orígenes permitidos separados por coma (producción + previews).
  const origins = config
    .get("WEB_ORIGIN", { infer: true })
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);
  // credentials: la web manda las cookies de sesión en cada pedido.
  app.enableCors({ origin: origins, credentials: true });
}
