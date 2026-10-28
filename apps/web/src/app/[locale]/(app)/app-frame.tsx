import { cookies } from "next/headers";
import { getLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { redirect } from "@/i18n/navigation";
import { getCurrentUser, getWorkspaces } from "@/lib/api/server";
import {
  isSidebarCollapsed,
  SIDEBAR_COOKIE,
} from "@/lib/workspaces/sidebar-cookie";
import { AppChrome } from "./app-chrome";

// Datos del shell, en el servidor: el usuario, sus espacios y si el sidebar estaba colapsado. Un
// access vigente de una sesión revocada pasa el proxy pero no la API: ahí se va a /login, que
// confirma con la API y borra las cookies.
export async function AppFrame({ children }: { children: ReactNode }) {
  const [user, workspaces, cookieStore] = await Promise.all([
    getCurrentUser(),
    getWorkspaces(),
    cookies(),
  ]);
  if (!user) redirect({ href: "/login", locale: await getLocale() });
  return (
    <AppChrome
      user={user!}
      workspaces={workspaces ?? []}
      defaultCollapsed={isSidebarCollapsed(
        cookieStore.get(SIDEBAR_COOKIE)?.value,
      )}
    >
      {children}
    </AppChrome>
  );
}
