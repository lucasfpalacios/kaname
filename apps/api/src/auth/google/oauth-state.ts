import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

// Datos que viajan del inicio del login con Google al callback en una cookie httpOnly firmada
// (HMAC-SHA256): el state (contra CSRF), el nonce (contra la reutilización del id_token), el
// code_verifier de PKCE y el destino. La firma impide que alguien los cambie.
export type OAuthState = {
  state: string;
  nonce: string;
  codeVerifier: string;
  next: string;
  /** Vencimiento, en ms. */
  expiresAt: number;
};

export const OAUTH_STATE_TTL_SECONDS = 10 * 60;

const random = () => randomBytes(32).toString("base64url");

export function newOAuthState(next: string): OAuthState {
  return {
    state: random(),
    nonce: random(),
    codeVerifier: random(),
    next,
    expiresAt: Date.now() + OAUTH_STATE_TTL_SECONDS * 1000,
  };
}

/** code_challenge de PKCE (S256): base64url(SHA-256(code_verifier)). */
export const codeChallenge = (verifier: string) =>
  createHash("sha256").update(verifier).digest("base64url");

const sign = (payload: string, secret: string) =>
  createHmac("sha256", `oauth-state:${secret}`)
    .update(payload)
    .digest("base64url");

export function sealOAuthState(data: OAuthState, secret: string): string {
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

/** La cookie si la firma es válida y no venció; si no, null. */
export function openOAuthState(
  sealed: string | undefined,
  secret: string,
): OAuthState | null {
  if (!sealed || sealed.length > 2048) return null;
  const [payload, signature, ...rest] = sealed.split(".");
  if (!payload || !signature || rest.length > 0) return null;
  const expected = Buffer.from(sign(payload, secret));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return null;
  }
  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as OAuthState;
    return data.expiresAt > Date.now() ? data : null;
  } catch {
    return null;
  }
}

/** Compara dos strings en tiempo constante. */
export function sameValue(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
