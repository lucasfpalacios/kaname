"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

// Tema claro / oscuro / sistema. Pone la clase .dark en <html>, que activa los tokens oscuros.
// El <html> de la app necesita suppressHydrationWarning.
//
// next-themes inyecta un <script> que aplica el tema antes de pintar. En el servidor tiene que
// ser JavaScript; en el cliente React no lo ejecuta y, si se vuelve a renderizar (por ejemplo al
// cambiar de idioma, que cambia el layout raíz), avisa con un error. Ahí se marca como bloque de
// datos para que React no lo trate como script. El script ya trae suppressHydrationWarning.
const scriptProps =
  typeof window === "undefined" ? undefined : { type: "application/json" };

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      scriptProps={scriptProps}
    >
      {children}
    </NextThemesProvider>
  );
}

export { useTheme } from "next-themes";
