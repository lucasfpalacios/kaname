import { KanameLogo } from "@kaname/ui";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { LocaleSwitcher } from "../locale-switcher";
import { ThemeToggle } from "../theme-toggle";

// Pantallas sin sesión (login, registro): logo arriba a la izquierda, idioma y tema a la derecha
// y la tarjeta centrada.
export default async function AuthLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  // Cada layout fija el idioma: sin esto next-intl lo lee de los headers del pedido.
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("Auth");
  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-background">
      <header className="flex items-center justify-between gap-4 p-4 md:px-6">
        <KanameLogo name={t("product")} size="sm" />
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 py-8 sm:items-center">
        {children}
      </main>
    </div>
  );
}
