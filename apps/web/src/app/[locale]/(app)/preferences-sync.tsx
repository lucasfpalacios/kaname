"use client";

import { useTheme, type ThemeChoice } from "@kaname/ui";
import type { Locale, Theme } from "@kaname/shared";
import { useLocale } from "next-intl";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  markPreferencesApplied,
  preferencesAppliedFor,
  savePreferences,
  takeLocaleChosen,
} from "@/lib/preferences/preferences";

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
// el usuario se guardan desde la TopBar, así que después ya coinciden. Si eligió el idioma en el
// login, gana esa elección: se guarda en el usuario en vez de aplicar la guardada. Se aplican una
// vez por pestaña y usuario (ver preferencesAppliedFor).
export function PreferencesSync({
  userId,
  locale,
  theme,
}: {
  userId: string;
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
    // Ya se aplicaron en esta pestaña: este es otro árbol (por ejemplo, el de otro idioma).
    if (preferencesAppliedFor(userId)) return;
    markPreferencesApplied(userId);
    if (currentTheme !== CHOICE[theme]) setTheme(CHOICE[theme]);
    if (takeLocaleChosen()) {
      if (currentLocale !== locale)
        void savePreferences({ locale: currentLocale as Locale });
    } else if (currentLocale !== locale) {
      router.replace(pathname, { locale });
    }
  }, [
    currentLocale,
    currentTheme,
    locale,
    pathname,
    router,
    setTheme,
    theme,
    userId,
  ]);

  return null;
}
