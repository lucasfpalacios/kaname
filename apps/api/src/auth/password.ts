import { randomUUID } from "node:crypto";
import { hash, verify, type Options } from "@node-rs/argon2";

// argon2id con los parámetros mínimos que recomienda OWASP: 19 MiB, 2 iteraciones, 1 hilo.
// `algorithm: 2` es Argon2id: el enum de @node-rs/argon2 es un const enum ambiental y con
// isolatedModules no se puede referenciar por nombre.
const OPTIONS: Options = {
  algorithm: 2,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
};

export function hashPassword(password: string): Promise<string> {
  return hash(password, OPTIONS);
}

// Hash de una contraseña que nadie conoce. Se verifica contra él cuando el email no existe o no
// tiene contraseña (solo Google), así la respuesta tarda lo mismo y no revela si el email existe.
let dummyHash: Promise<string> | undefined;

export async function verifyPassword(
  passwordHash: string | null | undefined,
  password: string,
): Promise<boolean> {
  dummyHash ??= hashPassword(randomUUID());
  const target = passwordHash ?? (await dummyHash);
  try {
    const ok = await verify(target, password);
    return ok && passwordHash != null;
  } catch {
    // Hash con formato inválido en la base: se trata como contraseña incorrecta.
    return false;
  }
}
