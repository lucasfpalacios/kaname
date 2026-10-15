"use client";

import { ThemeToggle as KitThemeToggle } from "@kaname/ui";
import { useTranslations } from "next-intl";

// El ThemeToggle del kit con los textos de next-intl.
export function ThemeToggle() {
  const t = useTranslations("ThemeToggle");
  return (
    <KitThemeToggle
      label={t("label")}
      labels={{ light: t("light"), dark: t("dark"), system: t("system") }}
    />
  );
}
