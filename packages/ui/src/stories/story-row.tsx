import type { ReactNode } from "react";

// Fila con etiqueta para mostrar variantes o estados uno al lado del otro.
export function StoryRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <span className="w-32 shrink-0 text-xs font-medium tracking-label uppercase opacity-70">
        {label}
      </span>
      {children}
    </div>
  );
}

// Los elementos con estas clases se ven con hover o foco forzado (storybook-addon-pseudo-states).
export const forcedStates = {
  pseudo: { hover: ".force-hover", focusVisible: ".force-focus" },
};
