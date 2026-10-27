import { fakeContext } from "../../test/support/contexts.js";
import { passwordResetTests } from "../../test/support/password-reset-flow.js";

// Recuperación de contraseña por HTTP con Prisma en memoria; la misma suite corre contra
// Postgres en test/password-reset.e2e-spec.ts.
passwordResetTests("Recuperación de contraseña (en memoria)", fakeContext);
