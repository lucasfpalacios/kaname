import type { ReactNode } from "react";

// Muestra el mismo contenido en claro y en oscuro lado a lado, sin depender del tema de la barra.
export function ThemePanels({
  labels,
  children,
}: {
  labels: { light: string; dark: string };
  children: ReactNode;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {(["light", "dark"] as const).map((theme) => (
        <section
          key={theme}
          className={`${theme} rounded-lg border border-border bg-background p-6 text-foreground`}
        >
          <p className="mb-4 text-xs font-medium tracking-label uppercase">
            {labels[theme]}
          </p>
          {children}
        </section>
      ))}
    </div>
  );
}
