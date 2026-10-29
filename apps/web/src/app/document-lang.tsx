"use client";

import { useLayoutEffect } from "react";

// `lang` del <html>. El <html> del layout raíz es estático (con Cache Components, leer la cookie
// ahí haría que nada de la página se pudiera prerenderizar), así que el idioma lo pone esto:
// - Al cargar la página, un script en línea que llega con el contenido y corre antes de pintarlo.
//   En el navegador se renderiza como texto (type="text/plain"): React no ejecuta scripts que
//   crea él y avisaría en desarrollo.
// - Después de cambiar de idioma (router.refresh), el efecto.
export function DocumentLang({ locale }: { locale: string }) {
  useLayoutEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: `document.documentElement.lang=${JSON.stringify(locale)}`,
      }}
    />
  );
}
