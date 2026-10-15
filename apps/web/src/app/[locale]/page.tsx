import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Currency, moneySchema } from "@kaname/shared";
import { intlLocale, routing } from "@/i18n/routing";
import { LocaleSwitcher } from "./locale-switcher";
import { ThemeToggle } from "./theme-toggle";

// Página de prueba de los fundamentos (tokens, fuentes, tema, idioma).
// Se reemplaza por el launcher en la Fase 2.
const monto = moneySchema.parse({
  amount: "1234567.50",
  currency: Currency.ARS,
});

// Nombres de tokens (identificadores de código, no texto de interfaz).
const swatches = [
  "bg-background",
  "bg-card",
  "bg-primary",
  "bg-accent",
  "bg-accent-soft",
  "bg-success",
  "bg-warning",
  "bg-destructive",
];

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("Home");

  const montoFormateado = new Intl.NumberFormat(intlLocale[locale], {
    style: "currency",
    currency: monto.currency,
  }).format(monto.amount as Intl.StringNumericLiteral);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-8 px-6 py-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="font-display text-3xl font-extrabold">{t("title")}</h1>
        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </div>

      <p className="text-base">{t("intro")}</p>

      <div className="rounded-lg border border-border bg-card p-6">
        <p className="text-xs font-medium uppercase tracking-label">
          {t("salesLabel")}
        </p>
        <p className="mt-2 whitespace-nowrap text-2xl font-bold tabular-nums text-primary">
          {montoFormateado}
        </p>
      </div>

      <ul className="grid grid-cols-4 gap-3" aria-label={t("paletteLabel")}>
        {swatches.map((clase) => (
          <li key={clase} className="flex flex-col gap-1 text-xs">
            <span className={`h-10 rounded-md border border-border ${clase}`} />
            {clase.replace("bg-", "")}
          </li>
        ))}
      </ul>
    </main>
  );
}
