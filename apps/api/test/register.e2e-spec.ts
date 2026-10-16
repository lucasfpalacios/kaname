import { registerTests } from "./support/auth-flow.js";
import { postgresContext } from "./support/contexts.js";
import { testPrisma } from "./support/postgres.js";

// Registro habilitado contra Postgres real (ver src/auth/register.spec.ts).
vi.hoisted(() => {
  process.env.REGISTRATION_ENABLED = "true";
});

const prisma = testPrisma();

registerTests("Registro habilitado (Postgres)", () => postgresContext(prisma));
