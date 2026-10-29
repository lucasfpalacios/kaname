"use client";

import { LocaleSwitch, revealLocaleChange } from "@kaname/ui";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { markLocaleChosen } from "@/lib/preferences/preferences";

// Selector de idioma: el LocaleSwitch del kit (ES | EN) con el ruteo de next-intl y la cortina al
// cambiar (revealLocaleChange): barre la pantalla de borde a borde hacia donde va la píldora. Con
// sesión, `onLocaleChange` guarda el idioma en el usuario antes de navegar: si falla, no cambia
// (si no, al volver a cargar se aplicaría el guardado). Sin sesión (login), se anota la elección
// y se guarda al entrar.
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
    <LocaleSwitch
      label={t("label")}
      value={locale}
      disabled={isPending}
      options={routing.locales.map((option) => ({
        value: option,
        short: option.toUpperCase(),
        name: t(`locales.${option}`),
      }))}
      onValueChange={(value) => {
        const next = value as Locale;
        const direction =
          routing.locales.indexOf(next) >
          routing.locales.indexOf(locale as Locale)
            ? "right"
            : "left";
        startTransition(async () => {
          if (!onLocaleChange) markLocaleChosen();
          else if (!(await onLocaleChange(next))) return;
          revealLocaleChange({
            target: next,
            direction,
            apply: () => router.replace(pathname, { locale: next }),
          });
        });
      }}
    />
  );
}
