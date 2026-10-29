import { localeSchema } from "@kaname/shared";

// Idiomas de la app. Salen del enum Locale del dominio (el mismo de User.locale en Prisma). La URL
// no lleva el idioma: se elige por pedido (ver i18n/request.ts) y las rutas son iguales en todos.
export const locales = localeSchema.options;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "es";

/**
 * Cookie con el idioma elegido. La escribe el navegador al cambiar de idioma (con o sin sesión) y
 * al entrar con un usuario que tiene otro guardado. No es httpOnly: el switch la escribe.
 */
export const LOCALE_COOKIE = "kaname_locale";

export const isLocale = (value: unknown): value is Locale =>
  locales.includes(value as Locale);

/** El primer idioma soportado del header Accept-Language ("en-US,en;q=0.9" → "en"). */
export function localeFromAcceptLanguage(header: string | null) {
  const ranked = (header ?? "")
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((param) => param.trim().startsWith("q="));
      return {
        language: tag.trim().toLowerCase().split("-")[0],
        weight: q ? Number(q.trim().slice(2)) : 1,
      };
    })
    .filter((item) => item.language && item.weight > 0)
    .sort((a, b) => b.weight - a.weight);
  return ranked.find((item) => isLocale(item.language))?.language as
    Locale | undefined;
}

/** Idioma del pedido: el de la cookie, si no el del navegador (Accept-Language), si no español. */
export function resolveLocale(
  cookie: string | undefined,
  acceptLanguage: string | null,
) {
  if (isLocale(cookie)) return cookie;
  return localeFromAcceptLanguage(acceptLanguage) ?? defaultLocale;
}

// Locale completo para Intl (montos y fechas): es-AR / en-US.
export const intlLocale: Record<Locale, string> = {
  es: "es-AR",
  en: "en-US",
};

// Zona horaria para mostrar fechas con hora: la misma en el servidor y en el navegador (si no,
// pueden mostrar horas distintas). Hoy los espacios son de Argentina.
export const TIME_ZONE = "America/Argentina/Buenos_Aires";
