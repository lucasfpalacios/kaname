import { localeOfPath, loginPath } from "@/lib/auth/login-path";
import { createApiClient } from "./client";

// Cliente de la API del navegador (uno por pestaña). Si la sesión no se puede renovar, va a
// /login y vuelve después a la página actual.
export const { apiFetch } = createApiClient({
  onSessionExpired: () => {
    const { pathname, search } = window.location;
    window.location.assign(
      loginPath(localeOfPath(pathname), pathname + search),
    );
  },
});
