import { authFlowTests } from "../../test/support/auth-flow.js";
import { fakeContext } from "../../test/support/contexts.js";

// Flujo de auth completo por HTTP (cookies, guards, rate limit) con Prisma en memoria. Corre en
// `pnpm test` sin base de datos; la misma suite corre contra Postgres en test/auth.e2e-spec.ts.
authFlowTests("Auth (Prisma en memoria)", fakeContext);
