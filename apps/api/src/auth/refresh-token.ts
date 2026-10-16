import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

// Refresh token opaco: "<sessionId>.<secreto>". El secreto son 32 bytes al azar (base64url) y en
// la base se guarda solo su SHA-256: con esa entropía no hace falta un hash lento como argon2.
// El id de la sesión permite encontrarla aunque el secreto ya haya rotado, y así detectar que se
// está reutilizando un refresh viejo.

export type ParsedRefreshToken = { sessionId: string; secret: string };

export function newRefreshSecret(): string {
  return randomBytes(32).toString("base64url");
}

export function hashRefreshSecret(secret: string): string {
  return createHash("sha256").update(secret).digest("hex");
}

export function formatRefreshToken(sessionId: string, secret: string): string {
  return `${sessionId}.${secret}`;
}

export function parseRefreshToken(
  token: string | undefined,
): ParsedRefreshToken | null {
  if (!token || token.length > 256) return null;
  const [sessionId, secret, ...rest] = token.split(".");
  if (!sessionId || !secret || rest.length > 0) return null;
  return { sessionId, secret };
}

/** Compara hashes en tiempo constante. */
export function sameHash(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
