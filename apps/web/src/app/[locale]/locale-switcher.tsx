"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@kaname/ui";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { markLocaleChosen } from "@/lib/preferences/preferences";

// Selector de idioma: el Select del kit con el ruteo de next-intl. Con sesión, `onLocaleChange`
// guarda el idioma en el usuario antes de navegar: si falla, no cambia (si no, al volver a cargar
// se aplicaría el guardado). Sin sesión (login), se anota la elección y se guarda al entrar.
export function LocaleSwitcher({
  onLocaleChange,
}: {
  onLocaleChange?: (locale: Locale) => Promise<boolean>;
}) {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      value={locale}
      disabled={isPending}
      onValueChange={(value) => {
        const next = value as Locale;
        startTransition(async () => {
          if (!onLocaleChange) markLocaleChosen();
          else if (!(await onLocaleChange(next))) return;
          router.replace(pathname, { locale: next });
        });
      }}
    >
      <SelectTrigger aria-label={t("label")} className="h-9 w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {routing.locales.map((option) => (
          <SelectItem key={option} value={option}>
            {t(`locales.${option}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
