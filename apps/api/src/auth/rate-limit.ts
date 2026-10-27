import { applyDecorators, UseGuards } from "@nestjs/common";
import { SkipThrottle, Throttle, ThrottlerGuard } from "@nestjs/throttler";

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
