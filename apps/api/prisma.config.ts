import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  // process.env y no env(): `prisma generate` no necesita la URL y así corre sin .env (CI, build).
  datasource: { url: process.env.DATABASE_URL },
});
