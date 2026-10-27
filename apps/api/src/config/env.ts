import { z } from "zod";

// Variables de entorno de la API, validadas al arrancar: si falta algo, la app no levanta.
// Ver apps/api/.env.example.
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().int().positive().default(4000),
  WEB_ORIGIN: z.string().min(1),
  // Vida del access token (JWT y cookie). 15 minutos; bajarlo solo para probar la renovación.
  ACCESS_TOKEN_TTL_SECONDS: z.coerce
    .number()
    .int()
    .min(30)
    .default(15 * 60),
  // Firma de los access tokens (HS256). Mínimo 32 caracteres; generar con `openssl rand -base64 48`.
  JWT_ACCESS_SECRET: z.string().min(32),
  // Intentos de login por IP en la ventana.
  LOGIN_RATE_LIMIT: z.coerce.number().int().positive().default(5),
  LOGIN_RATE_WINDOW_SECONDS: z.coerce.number().int().positive().default(60),
  // Intentos de login por email en la ventana (frena ataques a una cuenta desde muchas IPs).
  LOGIN_EMAIL_RATE_LIMIT: z.coerce.number().int().positive().default(10),
  LOGIN_EMAIL_RATE_WINDOW_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .default(15 * 60),
  // URL pública de la web: los links de los emails apuntan acá.
  WEB_URL: z.url().default("http://localhost:3000"),
  // Envío de emails con Resend. Sin clave, en desarrollo los emails se escriben en la consola.
  // Vacía cuenta como ausente (RESEND_API_KEY= en el .env).
  RESEND_API_KEY: z
    .string()
    .optional()
    .transform((value) => value || undefined),
  MAIL_FROM: z.string().min(3).default("Kaname <onboarding@resend.dev>"),
  // Registro abierto (POST /api/auth/register). Cualquier valor que no sea "true" lo cierra.
  REGISTRATION_ENABLED: z
    .string()
    .optional()
    .transform((value) => value === "true"),
  // Cantidad de proxies delante de la API (con el rewrite de Next: 1). Sin él, el rate limit vería
  // la IP del proxy.
  TRUST_PROXY: z.coerce.number().int().nonnegative().optional(),
});

export type Env = z.infer<typeof envSchema>;

// En producción los emails se mandan sí o sí: sin clave de Resend la API no arranca.
const productionSchema = envSchema.refine(
  (env) => env.NODE_ENV !== "production" || Boolean(env.RESEND_API_KEY),
  { path: ["RESEND_API_KEY"] },
);

export function validateEnv(config: Record<string, unknown>): Env {
  const result = productionSchema.safeParse(config);
  if (!result.success) {
    const fields = result.error.issues.map((issue) => issue.path.join("."));
    throw new Error(
      `Variables de entorno inválidas o faltantes: ${fields.join(", ")}`,
    );
  }
  return result.data;
}
