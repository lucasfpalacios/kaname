import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { intlLocale } from "@/i18n/locale";

// Vitrina del UI Kit dentro de la app real (fuentes, next-intl, tema). Solo en desarrollo: en el
// build de producción NODE_ENV es "production" y la ruta responde 404. La vitrina se importa
// adentro de la rama de desarrollo: en producción la condición es constante, el bundler descarta
// la rama y el código de la vitrina no entra al build.
const isProduction = process.env.NODE_ENV === "production";

// Vitrina de desarrollo: puede bloquear en el servidor. La validación de navegación instantánea no
// puede instanciar un componente cliente importado con import() (ver más abajo), así que se apaga.
export const instant = false;

// En producción no hay título: el 404 no tiene que mencionar la vitrina.
export function generateMetadata(): Metadata {
  if (isProduction) return {};
  return { title: "UI Kit", robots: { index: false, follow: false } };
}

export default async function UiKitPage() {
  if (process.env.NODE_ENV !== "production") {
    const locale = await getLocale();
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
