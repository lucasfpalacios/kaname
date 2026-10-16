import { authFlowTests } from "./support/auth-flow.js";
import { postgresContext } from "./support/contexts.js";
import { testPrisma } from "./support/postgres.js";

// El mismo flujo de auth que src/auth/auth.spec.ts, contra Postgres real (pnpm db:up).
const prisma = testPrisma();

authFlowTests("Auth (Postgres)", () => postgresContext(prisma));
