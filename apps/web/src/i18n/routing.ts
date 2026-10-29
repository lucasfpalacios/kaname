import { localeSchema } from "@kaname/shared";
import { defineRouting } from "next-intl/routing";

// Español sin prefijo (/productos), inglés con /en (/en/productos).
// Los idiomas salen del enum Locale del dominio (el mismo de User.locale en Prisma).
export const routing = defineRouting({
  locales: localeSchema.options,
  defaultLocale: "es",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];

// Locale completo para Intl (montos y fechas): es-AR / en-US.
export const intlLocale: Record<Locale, string> = {
  es: "es-AR",
  en: "en-US",
};

// Zona horaria para mostrar fechas con hora: la misma en el servidor y en el navegador (si no,
// pueden mostrar horas distintas). Hoy los espacios son de Argentina.
export const TIME_ZONE = "America/Argentina/Buenos_Aires";
