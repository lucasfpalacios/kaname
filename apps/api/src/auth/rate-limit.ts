import { applyDecorators, UseGuards } from "@nestjs/common";
import { SkipThrottle, Throttle, ThrottlerGuard } from "@nestjs/throttler";

/** Links de recuperación por email por hora: cada uno es un email a esa casilla. */
export const FORGOT_PASSWORD_EMAIL_LIMIT = 3;

/**
 * Rate limit de forgot-password: el de IP del login y, por email, 3 por hora en vez de 10 cada
 * 15 minutos. Así no sirve para llenar de emails una casilla ni gastar la cuota de Resend.
 */
export const ForgotPasswordRateLimit = () =>
  applyDecorators(
    UseGuards(ThrottlerGuard),
    Throttle({
      email: { limit: FORGOT_PASSWORD_EMAIL_LIMIT, ttl: 60 * 60_000 },
    }),
  );

/** Pedidos por IP por minuto en las rutas de sesión (refresh, logout, callback de Google). */
export const SESSION_RATE_LIMIT = 30;

/**
 * Rate limit de las rutas de sesión: solo por IP y más holgado que el del login, porque la web
 * las usa sola (cada pestaña renueva el access cada 15 minutos). Frena que se prueben refresh o
 * códigos de Google a repetición.
 */
export const SessionRateLimit = () =>
  applyDecorators(
    UseGuards(ThrottlerGuard),
    SkipThrottle({ email: true }),
    Throttle({ ip: { limit: SESSION_RATE_LIMIT, ttl: 60_000 } }),
  );
