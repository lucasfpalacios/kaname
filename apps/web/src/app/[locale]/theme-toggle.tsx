"use client";

import { type ThemeChoice, ThemeToggle as KitThemeToggle } from "@kaname/ui";
import { useTranslations } from "next-intl";

// El ThemeToggle del kit con los textos de next-intl. Con sesión, `onThemeChange` lo guarda en el
// usuario.
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
      onThemeChange={onThemeChange}
    />
  );
}
