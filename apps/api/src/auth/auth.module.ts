import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { ThrottlerModule } from "@nestjs/throttler";
import { ErrorCode } from "@kaname/shared";
import type { Env } from "../config/env.js";
import { AccessTokenGuard } from "./access-token.guard.js";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { PasswordResetService } from "./password-reset.service.js";
import { GoogleAuthController } from "./google/google-auth.controller.js";
import { GoogleAuthService } from "./google/google-auth.service.js";
import { GoogleOAuthClient } from "./google/google-oauth.client.js";
import { MailModule } from "../mail/mail.module.js";

// El guard corre antes de la validación: el email se normaliza igual que en loginSchema. Sin
// email (body inválido) se cuenta por IP, para no mezclar a todos en una sola clave.
function emailTracker(req: {
  body?: { email?: unknown };
  ip?: string;
}): string {
  const email = req.body?.email;
  return typeof email === "string" && email.trim()
    ? `email:${email.trim().toLowerCase()}`
    : `ip:${req.ip ?? ""}`;
}

@Module({
  imports: [
    MailModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        secret: config.get("JWT_ACCESS_SECRET", { infer: true }),
        signOptions: {
          algorithm: "HS256",
          expiresIn: config.get("ACCESS_TOKEN_TTL_SECONDS", { infer: true }),
        },
        verifyOptions: { algorithms: ["HS256"] },
      }),
    }),
    // Solo lo usan login y registro (con @UseGuards(ThrottlerGuard)). Dos límites a la vez:
    // por IP y por email, así un ataque a una cuenta desde muchas IPs también se frena. En
    // memoria: alcanza con una instancia; con varias habría que pasar a un storage compartido.
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        throttlers: [
          {
            name: "ip",
            limit: config.get("LOGIN_RATE_LIMIT", { infer: true }),
            ttl:
              config.get("LOGIN_RATE_WINDOW_SECONDS", { infer: true }) * 1000,
          },
          {
            name: "email",
            limit: config.get("LOGIN_EMAIL_RATE_LIMIT", { infer: true }),
            ttl:
              config.get("LOGIN_EMAIL_RATE_WINDOW_SECONDS", { infer: true }) *
              1000,
            getTracker: emailTracker,
          },
        ],
        errorMessage: ErrorCode.tooManyAttempts,
      }),
    }),
  ],
  controllers: [AuthController, GoogleAuthController],
  providers: [
    AuthService,
    PasswordResetService,
    GoogleAuthService,
    GoogleOAuthClient,
    AccessTokenGuard,
  ],
  exports: [AuthService, AccessTokenGuard],
})
export class AuthModule {}
