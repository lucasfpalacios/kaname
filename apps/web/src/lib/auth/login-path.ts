import { routing } from "@/i18n/routing";

// /login en el idioma dado: español sin prefijo, inglés con /en (localePrefix: "as-needed").
export function loginPath(locale: string, next?: string) {
  const base = locale === routing.defaultLocale ? "/login" : `/${locale}/login`;
  return next ? `${base}?next=${encodeURIComponent(next)}` : base;
}

/** Idioma de una ruta ("/en/ui-kit" → "en"). */
export function localeOfPath(pathname: string) {
  const segment = pathname.split("/")[1];
  return (
    routing.locales.find((locale) => locale === segment) ??
    routing.defaultLocale
  );
}
