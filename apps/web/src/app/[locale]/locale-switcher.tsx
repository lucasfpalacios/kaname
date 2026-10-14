"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

// Temporal para probar i18n: el selector definitivo va al UI Kit en la Fase 0.5.
export function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-2 text-sm">
      <span>{t("label")}</span>
      <select
        value={locale}
        disabled={isPending}
        onChange={(event) => {
          const next = event.target.value as Locale;
          startTransition(() => router.replace(pathname, { locale: next }));
        }}
        className="rounded-md border border-border bg-card px-3 py-2 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {routing.locales.map((option) => (
          <option key={option} value={option}>
            {t(`locales.${option}`)}
          </option>
        ))}
      </select>
    </label>
  );
}
