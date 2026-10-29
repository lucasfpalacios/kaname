"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";

// Caché de TanStack Query de las páginas con sesión (una por pestaña). Los datos se consideran
// frescos 30 s: volver a una pantalla no repite el pedido enseguida; las mutaciones invalidan lo
// que cambian. Un error de la API (4xx) no se reintenta: no va a cambiar.
export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: (count, error) =>
              count < 2 && (error as { code?: string }).code === "unknown",
          },
        },
      }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
