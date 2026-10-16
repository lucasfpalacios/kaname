import { registerTests } from "../../test/support/auth-flow.js";
import { fakeContext } from "../../test/support/contexts.js";

// Registro habilitado. Se activa antes de importar la app: ConfigModule valida el entorno al
// importarse (el resto de los tests corre con el registro cerrado).
vi.hoisted(() => {
  process.env.REGISTRATION_ENABLED = "true";
});

registerTests("Registro habilitado (Prisma en memoria)", fakeContext);
