import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ErrorCode, type LoginInput, type RegisterInput } from "@kaname/shared";
import { Prisma, type User } from "../generated/prisma/client.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { REFRESH_TOKEN_TTL_SECONDS } from "./cookies.js";
import { hashPassword, verifyPassword } from "./password.js";
import {
  formatRefreshToken,
  hashRefreshSecret,
  newRefreshSecret,
  parseRefreshToken,
  sameHash,
} from "./refresh-token.js";

export type AuthTokens = { accessToken: string; refreshToken: string };

/** Lo que devuelven /auth/login y /auth/me: nunca el hash ni datos internos. */
export type PublicUser = Pick<
  User,
  "id" | "email" | "name" | "avatarUrl" | "isSuperadmin" | "locale" | "theme"
>;

/** Lo que va en el access token (JWT). */
export type AccessTokenPayload = { sub: string; sid: string };

/**
 * Margen para refresh en paralelo: si llega el refresh anterior hasta 30 s después de rotarlo
 * (dos pestañas o pedidos simultáneos), se rechaza sin revocar nada. Pasado el margen es una
 * reutilización y se revocan todas las sesiones del usuario.
 */
export const REFRESH_REUSE_GRACE_SECONDS = 30;

const refreshExpiry = () =>
  new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000);

export function toPublicUser(user: User): PublicUser {
  const { id, email, name, avatarUrl, isSuperadmin, locale, theme } = user;
  return { id, email, name, avatarUrl, isSuperadmin, locale, theme };
}

const unauthenticated = () =>
  new UnauthorizedException(ErrorCode.unauthenticated);

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  // Mismo error y mismo tiempo de respuesta si el email no existe, si no tiene contraseña (solo
  // Google) o si la contraseña no coincide: no revela qué emails están registrados.
  async login(
    input: LoginInput,
    userAgent: string | undefined,
  ): Promise<{ user: PublicUser; tokens: AuthTokens }> {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email },
    });
    const ok = await verifyPassword(user?.passwordHash, input.password);
    if (!user || !ok) {
      throw new UnauthorizedException(ErrorCode.invalidCredentials);
    }
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    const tokens = await this.createSession(user.id, userAgent);
    return { user: toPublicUser(updated), tokens };
  }

  // Crea el usuario y lo deja con la sesión iniciada. El registro abierto se controla en el
  // controller (REGISTRATION_ENABLED). Revela si el email ya existe (email_taken), como todo
  // registro; por eso pasa por el mismo rate limit que el login.
  async register(
    input: RegisterInput,
    userAgent: string | undefined,
  ): Promise<{ user: PublicUser; tokens: AuthTokens }> {
    try {
      const user = await this.prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          passwordHash: await hashPassword(input.password),
          lastLoginAt: new Date(),
        },
      });
      const tokens = await this.createSession(user.id, userAgent);
      return { user: toPublicUser(user), tokens };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException(ErrorCode.emailTaken);
      }
      throw error;
    }
  }

  // Rota el refresh token: el viejo deja de servir y se emite uno nuevo (y un access nuevo).
  // Si llega un refresh de una sesión que existe pero con un secreto que no es el vigente:
  // - es el anterior y la rotación fue hace menos de REFRESH_REUSE_GRACE_SECONDS: pedidos en
  //   paralelo, 401 sin revocar nada;
  // - es el anterior, pasado el margen: uno ya rotado que alguien está reutilizando (posible
  //   robo), se revocan todas las sesiones del usuario;
  // - no coincide con ninguno: un secreto inventado (alcanza con conocer el id de la sesión, que
  //   va en el access), 401 sin revocar nada, así no sirve para desloguear a nadie.
  async refresh(
    rawToken: string | undefined,
    userAgent: string | undefined,
  ): Promise<AuthTokens> {
    const parsed = parseRefreshToken(rawToken);
    if (!parsed) throw unauthenticated();

    const session = await this.prisma.session.findUnique({
      where: { id: parsed.sessionId },
    });
    if (!session) throw unauthenticated();

    const presentedHash = hashRefreshSecret(parsed.secret);
    if (!sameHash(presentedHash, session.refreshTokenHash)) {
      const isPrevious =
        session.previousTokenHash !== null &&
        sameHash(presentedHash, session.previousTokenHash);
      if (isPrevious && !this.isWithinGrace(session, presentedHash)) {
        await this.revokeAll(session.userId, "refresh reutilizado");
      }
      throw unauthenticated();
    }
    if (session.expiresAt <= new Date()) {
      await this.prisma.session.deleteMany({ where: { id: session.id } });
      throw unauthenticated();
    }

    // La condición sobre el hash vigente hace la rotación atómica: si otro pedido rotó primero,
    // no se actualiza nada. Es una carrera de milisegundos (dentro del margen): 401 sin revocar.
    const secret = newRefreshSecret();
    const { count } = await this.prisma.session.updateMany({
      where: { id: session.id, refreshTokenHash: session.refreshTokenHash },
      data: {
        refreshTokenHash: hashRefreshSecret(secret),
        previousTokenHash: session.refreshTokenHash,
        rotatedAt: new Date(),
        expiresAt: refreshExpiry(),
        userAgent: userAgent ?? session.userAgent,
      },
    });
    if (count === 0) throw unauthenticated();

    return {
      accessToken: await this.signAccess(session.userId, session.id),
      refreshToken: formatRefreshToken(session.id, secret),
    };
  }

  // Cierra la sesión del refresh presentado (si es el vigente) o, si no hay refresh, la del
  // access token. Siempre termina bien: el cliente borra las cookies igual.
  async logout(rawRefresh: string | undefined, sessionId: string | undefined) {
    const parsed = parseRefreshToken(rawRefresh);
    if (parsed) {
      await this.prisma.session.deleteMany({
        where: {
          id: parsed.sessionId,
          refreshTokenHash: hashRefreshSecret(parsed.secret),
        },
      });
    } else if (sessionId) {
      await this.prisma.session.deleteMany({ where: { id: sessionId } });
    }
  }

  async me(userId: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw unauthenticated();
    return toPublicUser(user);
  }

  /** Verifica el access token y que su sesión siga viva (no cerrada ni revocada). */
  async verifyAccess(token: string | undefined): Promise<AccessTokenPayload> {
    if (!token) throw unauthenticated();
    let payload: AccessTokenPayload;
    try {
      payload = await this.jwt.verifyAsync<AccessTokenPayload>(token);
    } catch {
      throw unauthenticated();
    }
    const session = await this.prisma.session.findUnique({
      where: { id: payload.sid },
    });
    if (
      !session ||
      session.userId !== payload.sub ||
      session.expiresAt <= new Date()
    ) {
      throw unauthenticated();
    }
    return payload;
  }

  /** Inicia sesión para un usuario ya autenticado por otro medio (Google). */
  async startSession(
    userId: string,
    userAgent: string | undefined,
  ): Promise<AuthTokens> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
    return this.createSession(userId, userAgent);
  }

  private async createSession(
    userId: string,
    userAgent: string | undefined,
  ): Promise<AuthTokens> {
    const secret = newRefreshSecret();
    const session = await this.prisma.session.create({
      data: {
        userId,
        refreshTokenHash: hashRefreshSecret(secret),
        userAgent: userAgent?.slice(0, 512),
        expiresAt: refreshExpiry(),
      },
    });
    return {
      accessToken: await this.signAccess(userId, session.id),
      refreshToken: formatRefreshToken(session.id, secret),
    };
  }

  private isWithinGrace(
    session: { previousTokenHash: string | null; rotatedAt: Date | null },
    presentedHash: string,
  ): boolean {
    if (!session.previousTokenHash || !session.rotatedAt) return false;
    const elapsed = Date.now() - session.rotatedAt.getTime();
    return (
      sameHash(presentedHash, session.previousTokenHash) &&
      elapsed <= REFRESH_REUSE_GRACE_SECONDS * 1000
    );
  }

  private signAccess(userId: string, sessionId: string): Promise<string> {
    const payload: AccessTokenPayload = { sub: userId, sid: sessionId };
    return this.jwt.signAsync(payload);
  }

  private async revokeAll(userId: string, reason: string) {
    const { count } = await this.prisma.session.deleteMany({
      where: { userId },
    });
    this.logger.warn(
      `${reason}: se revocaron ${count} sesiones del usuario ${userId}`,
    );
  }
}
