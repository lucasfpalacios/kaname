"use client";

import { useTheme, type ThemeChoice } from "@kaname/ui";
import type { Locale, Theme } from "@kaname/shared";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useRef } from "react";
import {
  markPreferencesApplied,
  preferencesAppliedFor,
  savePreferences,
  saveTheme,
  setLocaleCookie,
  takeLocaleChosen,
  takeThemeChosen,
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
// idioma de la cookie o el tema del navegador no coinciden, los cambia una vez (el idioma, con la
// cookie y un router.refresh() en transición: sin recargar). Los cambios que hace
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
  const applied = useRef(false);

  useEffect(() => {
    // next-themes no conoce el tema hasta montar.
    if (applied.current || currentTheme === undefined) return;
    applied.current = true;
    // Ya se aplicaron en esta pestaña (el shell se volvió a montar, por ejemplo al volver del login).
    if (preferencesAppliedFor(userId)) return;
    markPreferencesApplied(userId);
    // Un tema elegido en el login gana: se guarda en vez de aplicar el del usuario.
    if (takeThemeChosen()) {
      if (currentTheme !== CHOICE[theme]) {
        void saveTheme(themeOf(currentTheme as ThemeChoice));
      }
    } else if (currentTheme !== CHOICE[theme]) {
      setTheme(CHOICE[theme]);
    }
    if (takeLocaleChosen()) {
      if (currentLocale !== locale)
        void savePreferences({ locale: currentLocale as Locale });
    } else if (currentLocale !== locale) {
      setLocaleCookie(locale);
      startTransition(() => router.refresh());
    }
  }, [currentLocale, currentTheme, locale, router, setTheme, theme, userId]);

  return null;
}
