import { defineRouting } from "next-intl/routing";

// Español sin prefijo (/productos), inglés con /en (/en/productos).
export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];

// Locale completo para Intl (montos y fechas): es-AR / en-US.
export const intlLocale: Record<Locale, string> = {
  es: "es-AR",
  en: "en-US",
};
