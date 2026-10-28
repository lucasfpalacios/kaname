"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { type ReactNode, useLayoutEffect } from "react";

// Tema claro / oscuro / sistema. Pone la clase .dark en <html>, que activa los tokens oscuros.
// El <html> de la app necesita suppressHydrationWarning.
//
// next-themes inyecta un <script> que aplica el tema antes de pintar. En el servidor tiene que
// ser JavaScript; en el cliente React no lo ejecuta y, si se vuelve a renderizar (por ejemplo al
// cambiar de idioma, que cambia el layout raíz), avisa con un error. Ahí se marca como bloque de
// datos para que React no lo trate como script. El script ya trae suppressHydrationWarning.
const scriptProps =
  typeof window === "undefined" ? undefined : { type: "application/json" };

// Clave y valor por defecto de next-themes (no se cambian en el provider).
const STORAGE_KEY = "theme";
const DEFAULT_THEME = "system";

// Cada idioma tiene su propio layout raíz, y Next conserva oculta la página del idioma anterior
// (<Activity mode="hidden">) con su ThemeProvider. Ese provider guarda el tema en su estado: al
// volver a ese idioma se muestra con el tema que tenía cuando se ocultó y lo vuelve a aplicar
// (cambiar de idioma cambiaba el tema). Los efectos de layout corren al montar y cada vez que el
// árbol vuelve a mostrarse, antes de pintar: ahí el estado se alinea con lo guardado.
function SyncWithStorage() {
  const { theme, setTheme } = useTheme();
  useLayoutEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {
      return;
    }
    const expected = stored ?? DEFAULT_THEME;
    if (theme !== expected) setTheme(expected);
    // Solo al montar o al volver a mostrarse: el tema que se elige después ya es el guardado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={DEFAULT_THEME}
      storageKey={STORAGE_KEY}
      enableSystem
      disableTransitionOnChange
      scriptProps={scriptProps}
    >
      <SyncWithStorage />
      {children}
    </NextThemesProvider>
  );
}

export { useTheme } from "next-themes";
