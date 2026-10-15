import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

// Adaptado de shadcn/ui. Es decorativo: el contenedor que carga debería marcar aria-busy.
export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-md bg-foreground/10 motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}
