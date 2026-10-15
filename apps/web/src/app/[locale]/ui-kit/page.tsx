import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { intlLocale, routing } from "@/i18n/routing";

// Vitrina del UI Kit dentro de la app real (fuentes, next-intl, tema). Solo en desarrollo: en el
// build de producción NODE_ENV es "production" y la ruta responde 404. La vitrina se importa
// adentro de la rama de desarrollo: en producción la condición es constante, el bundler descarta
// la rama y el código de la vitrina no entra al build.
const isProduction = process.env.NODE_ENV === "production";

// En producción no hay título: el 404 no tiene que mencionar la vitrina.
export function generateMetadata(): Metadata {
  if (isProduction) return {};
  return { title: "UI Kit", robots: { index: false, follow: false } };
}

export default async function UiKitPage({
  params,
}: PageProps<"/[locale]/ui-kit">) {
  if (process.env.NODE_ENV !== "production") {
    const { locale } = await params;
    if (!hasLocale(routing.locales, locale)) notFound();
    setRequestLocale(locale);
    const { UiKitShowcase } = await import("./ui-kit-showcase");

    // Sin `messages`, el provider pasa todos los textos, incluidos los de UiKit que el layout
    // omite.
    return (
      <NextIntlClientProvider>
        <UiKitShowcase intlLocale={intlLocale[locale]} />
      </NextIntlClientProvider>
    );
  }
  notFound();
}
