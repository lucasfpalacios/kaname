import { postgresContext } from "./support/contexts.js";
import { googleLoginTests } from "./support/google-login-flow.js";
import { testPrisma } from "./support/postgres.js";

// La misma suite que src/auth/google/google-auth.spec.ts, contra Postgres (kaname_test).
const prisma = testPrisma();

googleLoginTests("Login con Google (Postgres)", () => postgresContext(prisma));
