"use client";

import { useTheme, type ThemeChoice } from "@kaname/ui";
import type { Locale, Theme } from "@kaname/shared";
import { useLocale } from "next-intl";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";

const CHOICE: Record<Theme, ThemeChoice> = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
};

/** "dark" → DARK (como se guarda en el usuario). */
export const themeOf = (choice: ThemeChoice): Theme =>
  (Object.keys(CHOICE) as Theme[]).find((key) => CHOICE[key] === choice)!;

// Aplica las preferencias guardadas en el usuario al entrar (por ejemplo desde otro equipo): si el
// idioma de la URL o el tema del navegador no coinciden, los cambia una vez. Los cambios que hace
// el usuario se guardan desde la TopBar, así que después ya coinciden.
export function PreferencesSync({
  locale,
  theme,
}: {
  locale: Locale;
  theme: Theme;
}) {
  const currentLocale = useLocale();
  const { theme: currentTheme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const applied = useRef(false);

  useEffect(() => {
    // next-themes no conoce el tema hasta montar.
    if (applied.current || currentTheme === undefined) return;
    applied.current = true;
    if (currentTheme !== CHOICE[theme]) setTheme(CHOICE[theme]);
    if (currentLocale !== locale) router.replace(pathname, { locale });
  }, [currentLocale, currentTheme, locale, pathname, router, setTheme, theme]);

  return null;
}
