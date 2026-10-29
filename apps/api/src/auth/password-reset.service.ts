import { createHash, randomBytes } from "node:crypto";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ErrorCode } from "@kaname/shared";
import type { Env } from "../config/env.js";
import { MailService } from "../mail/mail.service.js";
import { passwordResetEmail } from "../mail/password-reset.email.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { hashPassword } from "./password.js";

export const RESET_TOKEN_TTL_MINUTES = 30;

const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

const invalidToken = () => new BadRequestException(ErrorCode.resetTokenInvalid);

// Recuperación de contraseña. El token (32 bytes al azar) va solo en el link del email; en la base
// se guarda su SHA-256. Sirve una sola vez y vence a los 30 minutos. Pedir otro link invalida los
// anteriores, y usarlo cierra todas las sesiones del usuario.
@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  /**
   * Crea el link y manda el email si el usuario existe; si no, no hace nada. Quien llama no
   * espera el resultado: la respuesta HTTP es la misma (y tarda lo mismo) exista o no el email.
   */
  async requestReset(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return;

    const token = randomBytes(32).toString("base64url");
    // En una transacción: dos pedidos simultáneos no dejan dos links válidos a la vez.
    await this.prisma.$transaction(async (tx) => {
      await tx.passwordResetToken.deleteMany({
        where: { userId: user.id, usedAt: null },
      });
      await tx.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(token),
          expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60_000),
        },
      });
    });

    await this.mail.send(
      passwordResetEmail({
        to: user.email,
        name: user.name,
        locale: user.locale,
        url: this.resetUrl(token),
        minutes: RESET_TOKEN_TTL_MINUTES,
      }),
    );
  }

  /** Cambia la contraseña con el token del link y cierra todas las sesiones. */
  async resetPassword(token: string, password: string): Promise<void> {
    const found = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashToken(token) },
    });
    const now = new Date();
    if (!found || found.usedAt || found.expiresAt <= now) throw invalidToken();

    const passwordHash = await hashPassword(password);
    await this.prisma.$transaction(async (tx) => {
      // Reclamo atómico: si dos pedidos llegan con el mismo token, solo uno lo usa.
      const { count } = await tx.passwordResetToken.updateMany({
        where: { id: found.id, usedAt: null },
        data: { usedAt: now },
      });
      if (count === 0) throw invalidToken();
      await tx.user.update({
        where: { id: found.userId },
        data: { passwordHash },
      });
      await tx.passwordResetToken.deleteMany({
        where: { userId: found.userId, usedAt: null },
      });
      await tx.session.deleteMany({ where: { userId: found.userId } });
    });
    this.logger.log(
      `Contraseña restablecida: se cerraron las sesiones del usuario ${found.userId}`,
    );
  }

  // La URL no lleva el idioma: la página sale en el de la cookie del navegador.
  private resetUrl(token: string) {
    const base = this.config.get("WEB_URL", { infer: true }).replace(/\/$/, "");
    return `${base}/reset-password?token=${encodeURIComponent(token)}`;
  }
}
