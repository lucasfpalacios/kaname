import { Separator as SeparatorPrimitive } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

// Adaptado de shadcn/ui. Decorativo por defecto; con decorative={false} los lectores de
// pantalla lo anuncian como separador.
export function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      orientation={orientation}
      decorative={decorative}
      className={cn(
        "shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px data-[orientation=vertical]:self-stretch",
        className,
      )}
      {...props}
    />
  );
}
