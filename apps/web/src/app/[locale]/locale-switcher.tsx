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

// Selector de idioma: el Select del kit con el ruteo de next-intl.
export function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      value={locale}
      disabled={isPending}
      onValueChange={(next) =>
        startTransition(() =>
          router.replace(pathname, { locale: next as Locale }),
        )
      }
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
