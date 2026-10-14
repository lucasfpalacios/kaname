"use client";

import { useTheme } from "@kaname/ui";
import { useTranslations } from "next-intl";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// Temporal para probar los fundamentos: el toggle definitivo va al UI Kit en la Fase 0.5.
export function ThemeToggle() {
  const t = useTranslations("ThemeToggle");
  const { resolvedTheme, setTheme } = useTheme();
  // En el servidor no se conoce el tema: se muestra recién en el cliente.
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {mounted ? (isDark ? t("toLight") : t("toDark")) : t("loading")}
    </button>
  );
}
