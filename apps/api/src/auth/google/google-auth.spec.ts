import { fakeContext } from "../../../test/support/contexts.js";
import { googleLoginTests } from "../../../test/support/google-login-flow.js";

// Login con Google por HTTP con Prisma en memoria; la misma suite corre contra Postgres en
// test/google-auth.e2e-spec.ts.
googleLoginTests("Login con Google (en memoria)", fakeContext);
