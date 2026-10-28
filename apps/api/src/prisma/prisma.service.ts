import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

/** La base no responde al arrancar: main.ts muestra el mensaje y sale sin stack trace. */
export class DatabaseUnavailableError extends Error {}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(config: ConfigService) {
    super({
      adapter: new PrismaPg({
        connectionString: config.getOrThrow<string>("DATABASE_URL"),
        // Sin tope, un host que no responde deja el arranque (y /api/health) colgados.
        connectionTimeoutMillis: 10_000,
      }),
    });
    this.local = config.get<string>("NODE_ENV") !== "production";
  }

  private readonly logger = new Logger(PrismaService.name);
  private readonly local: boolean;

  // $connect() con el adapter de pg no abre ninguna conexión: sin esta consulta la API arrancaba
  // sin base y fallaba recién en el primer pedido (500 en el login).
  async onModuleInit() {
    try {
      await this.$queryRaw`SELECT 1`;
    } catch (error) {
      const hint = this.local
        ? "No se puede conectar a Postgres. ¿Está corriendo Docker? Probá pnpm db:up"
        : "No se puede conectar a Postgres: revisá DATABASE_URL.";
      this.logger.error(`${hint}\n  Detalle: ${errorDetail(error)}`);
      throw new DatabaseUnavailableError(hint);
    }
  }

  /** Si la base responde ahora (para /api/health). */
  async isReachable(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

// El mensaje de Prisma para un error de conexión viene casi vacío; el código del driver
// (ECONNREFUSED, ETIMEDOUT, 28P01...) dice qué pasó, sin mostrar la URL ni la contraseña.
function errorDetail(error: unknown): string {
  const { code, message } = (error ?? {}) as {
    code?: unknown;
    message?: unknown;
  };
  if (typeof code === "string" && code) return code;
  const lines = String(message ?? error)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.at(-1) ?? "sin detalle";
}
