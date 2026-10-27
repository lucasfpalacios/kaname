"use client";

import { useLocale } from "next-intl";
import { loginPath } from "@/lib/auth/login-path";

// Ruta de /login en el idioma actual, con ?next= opcional.
export function useLoginPath() {
  const locale = useLocale();
  return (next?: string) => loginPath(locale, next);
}
