import { PASSWORD_MIN_LENGTH } from "@kaname/shared";
import { hashPassword } from "../src/auth/password.js";

type UserStore = {
  user: {
    findUnique(args: {
      where: { email: string };
    }): Promise<{ id: string; passwordHash: string | null } | null>;
    update(args: {
      where: { id: string };
      data: { passwordHash: string };
    }): Promise<unknown>;
  };
};

export type SeedAdminPasswordResult =
  "set" | "missing-env" | "already-set" | "too-short";

// Contraseña inicial del usuario administrador, desde SEED_ADMIN_PASSWORD. Es inicial: si el
// usuario ya tiene una, no se pisa (correr el seed de nuevo no cambia la contraseña). Sin la
// variable no se pone contraseña y se avisa.
export async function seedAdminPassword(
  prisma: UserStore,
  email: string,
  password: string | undefined,
  log: (message: string) => void = console.warn,
): Promise<SeedAdminPasswordResult> {
  if (!password) {
    log(
      `SEED_ADMIN_PASSWORD no está definida: ${email} queda sin contraseña y no puede iniciar sesión con email.`,
    );
    return "missing-env";
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    log(
      `SEED_ADMIN_PASSWORD tiene menos de ${PASSWORD_MIN_LENGTH} caracteres: no se usó.`,
    );
    return "too-short";
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error(`No existe el usuario ${email}`);
  if (user.passwordHash) {
    log(`${email} ya tiene contraseña: SEED_ADMIN_PASSWORD no la cambia.`);
    return "already-set";
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(password) },
  });
  return "set";
}
