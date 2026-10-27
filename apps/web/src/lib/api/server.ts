import type { SessionUser } from "@kaname/shared";
import { cookies } from "next/headers";
import { ACCESS_COOKIE, nestUrl } from "../auth/constants";

// Llamadas a la API desde Server Components. El proxy (src/proxy.ts) ya renovó el access si
// estaba por vencer, así que acá alcanza con mandarlo. Sin sesión válida devuelve null y la
// página decide (normalmente, redirigir a /login).
export async function getCurrentUser(): Promise<SessionUser | null> {
  const access = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!access) return null;
  try {
    const response = await fetch(`${nestUrl()}/api/auth/me`, {
      headers: { cookie: `${ACCESS_COOKIE}=${encodeURIComponent(access)}` },
      cache: "no-store",
    });
    return response.ok ? ((await response.json()) as SessionUser) : null;
  } catch {
    return null;
  }
}

export async function getAuthOptions(): Promise<{
  registrationEnabled: boolean;
}> {
  try {
    const response = await fetch(`${nestUrl()}/api/auth/options`, {
      cache: "no-store",
    });
    if (response.ok)
      return (await response.json()) as { registrationEnabled: boolean };
  } catch {
    // Sin API, el registro se muestra cerrado.
  }
  return { registrationEnabled: false };
}
