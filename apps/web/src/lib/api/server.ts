import type {
  AccountSummary,
  SessionUser,
  WorkspaceSummary,
} from "@kaname/shared";
import { cookies } from "next/headers";
import { cache } from "react";
import { ACCESS_COOKIE, nestUrl } from "../auth/constants";

// Llamadas a la API desde Server Components. El proxy (src/proxy.ts) ya renovó el access si
// estaba por vencer, así que acá alcanza con mandarlo. Sin sesión válida devuelven null y la
// página decide (normalmente, redirigir a /login). Con cache() de React, el layout y la página
// del mismo pedido comparten una sola llamada.
async function getWithSession<T>(path: string): Promise<T | null> {
  const access = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!access) return null;
  try {
    const response = await fetch(`${nestUrl()}${path}`, {
      headers: { cookie: `${ACCESS_COOKIE}=${encodeURIComponent(access)}` },
      cache: "no-store",
    });
    return response.ok ? ((await response.json()) as T) : null;
  } catch {
    return null;
  }
}

export const getCurrentUser = cache(() =>
  getWithSession<SessionUser>("/api/auth/me"),
);

/** Mis cuentas con mi rol: puedo crear espacios en las que soy Dueño. */
export const getAccounts = cache(() =>
  getWithSession<AccountSummary[]>("/api/me/accounts"),
);

/** Mis espacios (sin los archivados), con sus módulos activos. */
export const getWorkspaces = cache(() =>
  getWithSession<WorkspaceSummary[]>("/api/workspaces"),
);

/**
 * El espacio de la URL (/w/[slug]), buscado entre los míos: si no es mío o no existe, null. El
 * slug es único por cuenta; si dos cuentas mías usan el mismo, gana el primero por nombre.
 */
export const getWorkspaceBySlug = cache(async (slug: string) => {
  const workspaces = await getWorkspaces();
  return workspaces?.find((workspace) => workspace.slug === slug) ?? null;
});

type AuthOptions = { registrationEnabled: boolean; googleEnabled: boolean };

export async function getAuthOptions(): Promise<AuthOptions> {
  try {
    const response = await fetch(`${nestUrl()}/api/auth/options`, {
      cache: "no-store",
    });
    if (response.ok) return (await response.json()) as AuthOptions;
  } catch {
    // Sin API, el registro y Google se muestran apagados.
  }
  return { registrationEnabled: false, googleEnabled: false };
}
