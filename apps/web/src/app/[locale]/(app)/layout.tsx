import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { routing } from "@/i18n/routing";
import { AppFrame } from "./app-frame";

// Páginas con sesión. El proxy ya mandó a /login a quien no tiene sesión; AppFrame carga el
// usuario y sus espacios para el shell (sidebar y TopBar). Todo depende de la sesión, así que va
// dentro de Suspense.
export default async function AppLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  // Cada layout fija el idioma: sin esto next-intl lo lee de los headers del pedido.
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return (
    <Suspense fallback={<div className="min-h-dvh bg-background" />}>
      <AppFrame>{children}</AppFrame>
    </Suspense>
  );
}
