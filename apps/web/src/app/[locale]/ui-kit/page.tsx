import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { intlLocale, routing } from "@/i18n/routing";
import { UiKitShowcase } from "./ui-kit-showcase";

// Vitrina del UI Kit dentro de la app real (fuentes, next-intl, tema). Solo en desarrollo: en el
// build de producción NODE_ENV es "production" y la ruta responde 404.
const isProduction = process.env.NODE_ENV === "production";

// En producción no hay título: el 404 no tiene que mencionar la vitrina.
export function generateMetadata(): Metadata {
  if (isProduction) return {};
  return { title: "UI Kit", robots: { index: false, follow: false } };
}

export default async function UiKitPage({
  params,
}: PageProps<"/[locale]/ui-kit">) {
  if (isProduction) notFound();
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  // Sin `messages`, el provider pasa todos los textos, incluidos los de UiKit que el layout omite.
  return (
    <NextIntlClientProvider>
      <UiKitShowcase intlLocale={intlLocale[locale]} />
    </NextIntlClientProvider>
  );
}
