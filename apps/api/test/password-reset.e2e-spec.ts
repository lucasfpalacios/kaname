import { postgresContext } from "./support/contexts.js";
import { passwordResetTests } from "./support/password-reset-flow.js";
import { testPrisma } from "./support/postgres.js";

// La misma suite que src/auth/password-reset.spec.ts, contra Postgres (kaname_test).
const prisma = testPrisma();

passwordResetTests("Recuperación de contraseña (Postgres)", () =>
  postgresContext(prisma),
);
