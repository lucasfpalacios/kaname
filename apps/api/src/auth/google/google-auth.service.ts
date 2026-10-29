import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ErrorCode, safeNextPath } from "@kaname/shared";
import type { Env } from "../../config/env.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { AuthService, type AuthTokens } from "../auth.service.js";
import {
  type GoogleCredentials,
  GOOGLE_AUTHORIZE_URL,
  GoogleOAuthClient,
} from "./google-oauth.client.js";
import {
  codeChallenge,
  newOAuthState,
  type OAuthState,
  openOAuthState,
  sameValue,
  sealOAuthState,
} from "./oauth-state.js";

const PROVIDER = "google";
const ISSUERS = new Set(["accounts.google.com", "https://accounts.google.com"]);

type IdTokenClaims = {
  iss?: unknown;
  aud?: unknown;
  exp?: unknown;
  nonce?: unknown;
  sub?: unknown;
  email?: unknown;
  email_verified?: unknown;
  name?: unknown;
  picture?: unknown;
};

export type GoogleCallbackResult =
  { ok: true; tokens: AuthTokens; next: string } | { ok: false; code: string };

class GoogleLoginError extends Error {
  constructor(readonly code: string) {
    super(code);
  }
}

// Login con Google (OAuth 2.0 con PKCE, state y nonce). Solo acepta emails verificados por Google.
// Si el email ya tiene cuenta, la vincula (OAuthAccount); si no, crea el usuario solo con el
// registro abierto (REGISTRATION_ENABLED). La sesión es la misma que la del login normal.
@Injectable()
export class GoogleAuthService {
  private readonly logger = new Logger(GoogleAuthService.name);

  constructor(
    private readonly config: ConfigService<Env, true>,
    private readonly prisma: PrismaService,
    private readonly auth: AuthService,
    private readonly google: GoogleOAuthClient,
  ) {}

  /** Credenciales de Google, o null si el login con Google está apagado. */
  credentials(): GoogleCredentials | null {
    const clientId = this.config.get("GOOGLE_CLIENT_ID", { infer: true });
    const clientSecret = this.config.get("GOOGLE_CLIENT_SECRET", {
      infer: true,
    });
    if (!clientId || !clientSecret) return null;
    const webUrl = this.config
      .get("WEB_URL", { infer: true })
      .replace(/\/$/, "");
    const redirectUri =
      this.config.get("GOOGLE_REDIRECT_URI", { infer: true }) ??
      `${webUrl}/api/auth/google/callback`;
    return { clientId, clientSecret, redirectUri };
  }

  /** URL de Google y la cookie firmada con lo que necesita el callback. */
  start(
    credentials: GoogleCredentials,
    next: string | undefined,
  ): { url: string; sealedState: string } {
    const data = newOAuthState(safeNextPath(next, "/"));
    const url = new URL(GOOGLE_AUTHORIZE_URL);
    url.search = new URLSearchParams({
      client_id: credentials.clientId,
      redirect_uri: credentials.redirectUri,
      response_type: "code",
      scope: "openid email profile",
      state: data.state,
      nonce: data.nonce,
      code_challenge: codeChallenge(data.codeVerifier),
      code_challenge_method: "S256",
      prompt: "select_account",
    }).toString();
    return {
      url: url.toString(),
      sealedState: sealOAuthState(data, this.secret()),
    };
  }

  async callback(
    credentials: GoogleCredentials,
    query: { code?: string; state?: string; error?: string },
    sealedState: string | undefined,
    userAgent: string | undefined,
  ): Promise<GoogleCallbackResult> {
    const data = openOAuthState(sealedState, this.secret());
    try {
      if (!data || !query.state || !sameValue(query.state, data.state)) {
        throw new GoogleLoginError(ErrorCode.oauthFailed);
      }
      // El usuario canceló en Google, o Google devolvió un error.
      if (query.error || !query.code) {
        throw new GoogleLoginError(ErrorCode.oauthFailed);
      }
      const idToken = await this.google.exchangeCode(
        query.code,
        data.codeVerifier,
        credentials,
      );
      const claims = this.validateIdToken(idToken, credentials, data);
      const userId = await this.findOrLinkUser(claims);
      const tokens = await this.auth.startSession(userId, userAgent);
      return { ok: true, tokens, next: data.next };
    } catch (error) {
      if (error instanceof GoogleLoginError)
        return { ok: false, code: error.code };
      this.logger.error(`Login con Google: ${String(error)}`);
      return { ok: false, code: ErrorCode.oauthFailed };
    }
  }

  // El id_token llega directo del endpoint de tokens de Google por TLS: según OpenID Connect
  // (3.1.3.7) eso valida el emisor sin verificar la firma. Se validan los claims.
  private validateIdToken(
    idToken: string,
    credentials: GoogleCredentials,
    data: OAuthState,
  ) {
    let claims: IdTokenClaims;
    try {
      claims = JSON.parse(
        Buffer.from(idToken.split(".")[1] ?? "", "base64url").toString("utf8"),
      ) as IdTokenClaims;
    } catch {
      throw new GoogleLoginError(ErrorCode.oauthFailed);
    }
    const valid =
      typeof claims.iss === "string" &&
      ISSUERS.has(claims.iss) &&
      claims.aud === credentials.clientId &&
      typeof claims.exp === "number" &&
      claims.exp * 1000 > Date.now() &&
      typeof claims.nonce === "string" &&
      sameValue(claims.nonce, data.nonce) &&
      typeof claims.sub === "string" &&
      typeof claims.email === "string";
    if (!valid) throw new GoogleLoginError(ErrorCode.oauthFailed);
    if (claims.email_verified !== true) {
      throw new GoogleLoginError(ErrorCode.googleEmailUnverified);
    }
    return {
      sub: claims.sub as string,
      email: (claims.email as string).trim().toLowerCase(),
      name:
        typeof claims.name === "string" && claims.name.trim()
          ? claims.name.trim()
          : null,
      picture: typeof claims.picture === "string" ? claims.picture : null,
    };
  }

  private async findOrLinkUser(claims: {
    sub: string;
    email: string;
    name: string | null;
    picture: string | null;
  }): Promise<string> {
    const account = await this.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerUserId: {
          provider: PROVIDER,
          providerUserId: claims.sub,
        },
      },
    });
    if (account) return account.userId;

    // Email verificado por Google que ya tiene cuenta: se vincula.
    const existing = await this.prisma.user.findUnique({
      where: { email: claims.email },
    });
    if (existing) {
      await this.prisma.oAuthAccount.create({
        data: {
          userId: existing.id,
          provider: PROVIDER,
          providerUserId: claims.sub,
        },
      });
      this.logger.log(`Google vinculado al usuario ${existing.id}`);
      return existing.id;
    }

    if (!this.config.get("REGISTRATION_ENABLED", { infer: true })) {
      throw new GoogleLoginError(ErrorCode.googleRegistrationClosed);
    }
    const user = await this.prisma.user.create({
      data: {
        email: claims.email,
        name: claims.name ?? claims.email.split("@")[0],
        avatarUrl: claims.picture,
      },
    });
    await this.prisma.oAuthAccount.create({
      data: { userId: user.id, provider: PROVIDER, providerUserId: claims.sub },
    });
    return user.id;
  }

  private secret() {
    return this.config.get("JWT_ACCESS_SECRET", { infer: true });
  }
}
