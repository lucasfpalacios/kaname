import { z } from "zod";
import type { Locale, Theme } from "../enums.js";
import { ErrorCode } from "../errors/codes.js";

// Login con email y contraseña. El email se normaliza (sin espacios, en minúscula) antes de
// buscarlo. La contraseña tiene un tope para no pasarle textos enormes a argon2.
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email(ErrorCode.emailInvalid)),
  password: z.string().min(1, ErrorCode.passwordRequired).max(1024),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Registro: misma normalización del email, nombre obligatorio y contraseña de al menos 12
// caracteres (largo antes que reglas de composición, como recomienda NIST 800-63B).
export const PASSWORD_MIN_LENGTH = 12;

export const registerSchema = z.object({
  name: z.string().trim().min(1, ErrorCode.nameRequired).max(120),
  email: loginSchema.shape.email,
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, ErrorCode.passwordTooShort)
    .max(1024),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// Lo que devuelven /api/auth/login, /api/auth/register y /api/auth/me.
export type SessionUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  isSuperadmin: boolean;
  locale: Locale;
  theme: Theme;
};
