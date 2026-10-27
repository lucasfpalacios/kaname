import {
  AppShell,
  KanameLogo,
  Skeleton,
  TopBar,
  TopBarActions,
} from "@kaname/ui";
import { hasLocale } from "next-intl";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getCurrentUser } from "@/lib/api/server";
import { LocaleSwitcher } from "../locale-switcher";
import { ThemeToggle } from "../theme-toggle";
import { UserMenuButton } from "./user-menu-button";
import { SessionKeeper } from "./session-keeper";

// Páginas con sesión. El proxy ya mandó a /login a quien no tiene sesión; acá se carga el usuario
// para el menú. El sidebar llega en la Fase 2.
export default async function AppLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  // Cada layout fija el idioma: sin esto next-intl lo lee de los headers del pedido.
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("Auth");
  return (
    <AppShell
      sidebar={null}
      topBar={
        <TopBar>
          <KanameLogo name={t("product")} size="sm" />
          <TopBarActions>
            <LocaleSwitcher />
            <ThemeToggle />
            <Suspense fallback={<Skeleton className="size-9 rounded-full" />}>
              <CurrentUserMenu />
            </Suspense>
          </TopBarActions>
        </TopBar>
      }
    >
      <SessionKeeper />
      {children}
    </AppShell>
  );
}

// Un access vigente de una sesión revocada pasa el proxy pero no la API: ahí se va a /login, que
// confirma con la API y borra las cookies.
async function CurrentUserMenu() {
  const user = await getCurrentUser();
  if (!user) redirect({ href: "/login", locale: await getLocale() });
  return <UserMenuButton user={user!} />;
}
