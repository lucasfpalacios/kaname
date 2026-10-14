import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  // Las migraciones usan la conexión directa: con Neon, DATABASE_URL pasa por el pooler (PgBouncer),
  // que no soporta lo que necesita Migrate. En local las dos son iguales.
  // process.env y no env(): `prisma generate` no necesita la URL y así corre sin .env (CI, build).
  datasource: { url: process.env.DIRECT_URL ?? process.env.DATABASE_URL },
});
