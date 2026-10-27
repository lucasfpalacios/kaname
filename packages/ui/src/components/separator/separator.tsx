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

/** Línea horizontal con un texto al medio ("o", entre dos formas de entrar). */
export function LabeledSeparator({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      data-slot="labeled-separator"
      className={cn(
        "flex items-center gap-3 text-xs text-foreground/70",
        className,
      )}
      {...props}
    >
      <Separator className="flex-1" />
      <span>{children}</span>
      <Separator className="flex-1" />
    </div>
  );
}
