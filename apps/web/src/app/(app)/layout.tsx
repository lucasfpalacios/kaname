import { Suspense } from "react";
import { AppFrame } from "./app-frame";

// Páginas con sesión. El proxy ya mandó a /login a quien no tiene sesión; AppFrame carga el
// usuario y sus espacios para el shell (sidebar y TopBar). Todo depende de la sesión, así que va
// dentro de Suspense.
export default async function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-background" />}>
      <AppFrame>{children}</AppFrame>
    </Suspense>
  );
}
