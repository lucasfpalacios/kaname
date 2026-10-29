import type { ComponentProps, ReactNode } from "react";
import { cn } from "../../lib/cn";

export type DescriptionItem = { term: string; description: ReactNode };

// Ficha de datos (término y valor por fila), por ejemplo en el detalle de un producto. Es una
// lista de definición (<dl>): el lector de pantalla asocia cada valor con su término.
export function DescriptionList({
  items,
  className,
  ...props
}: Omit<ComponentProps<"dl">, "children"> & { items: DescriptionItem[] }) {
  return (
    <dl
      data-slot="description-list"
      className={cn(
        "divide-y divide-border rounded-md border border-border bg-card text-sm",
        className,
      )}
      {...props}
    >
      {items.map((item) => (
        <div
          key={item.term}
          className="flex items-baseline justify-between gap-4 px-3 py-2"
        >
          <dt className="text-foreground/70">{item.term}</dt>
          <dd className="text-right font-medium">{item.description}</dd>
        </div>
      ))}
    </dl>
  );
}
