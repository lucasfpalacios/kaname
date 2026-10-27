"use client";

import { useTranslations } from "next-intl";

// Traduce un código de error de la API (Errors.<código>). Si el código no tiene traducción,
// un mensaje genérico.
export function useErrorMessage() {
  const errors = useTranslations("Errors");
  const auth = useTranslations("Auth");
  return (code: string) => {
    const key = code as Parameters<typeof errors>[0];
    return errors.has(key) ? errors(key) : auth("genericError");
  };
}
