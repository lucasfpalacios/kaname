"use client";

import { type ThemeChoice, ThemeToggle as KitThemeToggle } from "@kaname/ui";
import { useTranslations } from "next-intl";
import { markThemeChosen } from "@/lib/preferences/preferences";

// El ThemeToggle del kit con los textos de next-intl. Con sesión, `onThemeChange` lo guarda en el
// usuario; sin sesión, la elección se anota y PreferencesSync la guarda al entrar.
export function ThemeToggle({
  onThemeChange,
}: {
  onThemeChange?: (theme: ThemeChoice) => void;
}) {
  const t = useTranslations("ThemeToggle");
  return (
    <KitThemeToggle
      label={t("label")}
      labels={{ light: t("light"), dark: t("dark"), system: t("system") }}
      cycleLabel={(current, next) => t("cycle", { current, next })}
      // Sin sesión (login), se anota la elección y se guarda al entrar, como el idioma.
      onThemeChange={onThemeChange ?? (() => markThemeChosen())}
    />
  );
}
