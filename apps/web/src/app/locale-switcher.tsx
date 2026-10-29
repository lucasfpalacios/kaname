"use client";

import { LocaleSwitch } from "@kaname/ui";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { type Locale, locales } from "@/i18n/locale";
import {
  markLocaleChosen,
  setLocaleCookie,
} from "@/lib/preferences/preferences";

// Selector de idioma: el LocaleSwitch del kit (ES | EN). La URL no cambia: se fija la cookie de
// idioma y router.refresh() vuelve a renderizar la página en el servidor con los textos nuevos.
// Todo va en una transición: la vista actual queda visible hasta que llegan los textos, sin
// recargar el documento ni pasar por una pantalla en blanco. La píldora se mueve enseguida (valor
// optimista). Con sesión, `onLocaleChange` guarda el idioma en el usuario antes: si falla, no
// cambia. Sin sesión (login), se anota la elección y se guarda en el usuario al entrar.
export function LocaleSwitcher({
  onLocaleChange,
}: {
  onLocaleChange?: (locale: Locale) => Promise<boolean>;
}) {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [shown, setShown] = useOptimistic(locale);

  return (
    <LocaleSwitch
      label={t("label")}
      value={shown}
      disabled={isPending}
      options={locales.map((option) => ({
        value: option,
        short: option.toUpperCase(),
        name: t(`locales.${option}`),
      }))}
      onValueChange={(value) => {
        const next = value as Locale;
        startTransition(async () => {
          setShown(next);
          if (!onLocaleChange) markLocaleChosen();
          else if (!(await onLocaleChange(next))) return;
          setLocaleCookie(next);
          // Después de un await, la actualización tiene que marcarse de nuevo como transición.
          startTransition(() => router.refresh());
        });
      }}
    />
  );
}
