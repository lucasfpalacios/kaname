import { execFileSync } from "node:child_process";
import pg from "pg";
import { testDatabaseUrl } from "./test-database.js";

// Antes de los e2e: crea la base de prueba si no existe y le aplica las migraciones. Corre una
// vez por `pnpm test:e2e`.
export default async function setup() {
  const url = testDatabaseUrl();
  const target = new URL(url);
  const name = target.pathname.replace(/^\//, "");

  // Se conecta a la base "postgres" del mismo servidor para crear la de prueba.
  const admin = new URL(url);
  admin.pathname = "/postgres";
  const client = new pg.Client({ connectionString: admin.toString() });
  await client.connect();
  try {
    const exists = await client.query(
      "select 1 from pg_database where datname = $1",
      [name],
    );
    if (exists.rowCount === 0) {
      // El nombre ya pasó por testDatabaseUrl (termina en _test); se cita como identificador.
      await client.query(`create database "${name.replaceAll('"', '""')}"`);
    }
  } finally {
    await client.end();
  }

  execFileSync("pnpm", ["exec", "prisma", "migrate", "deploy"], {
    env: { ...process.env, DATABASE_URL: url, DIRECT_URL: url },
    stdio: "inherit",
  });
}
