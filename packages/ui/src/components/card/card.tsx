import { Slot } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

// Adaptado de shadcn/ui: borde sutil, sin sombra (tokens.md).
export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "flex flex-col gap-6 rounded-lg border border-border bg-card py-6 text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto]",
        className,
      )}
      {...props}
    />
  );
}

// El nivel de título depende de la página: con asChild se pasa el h2/h3 que corresponda.
export function CardTitle({
  className,
  asChild = false,
  ...props
}: ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "div";
  return (
    <Comp
      data-slot="card-title"
      className={cn(
        "font-display text-xl leading-tight font-semibold",
        className,
      )}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-sm text-foreground/70", className)}
      {...props}
    />
  );
}

export function CardAction({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  );
}

export function CardFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center gap-2 px-6", className)}
      {...props}
    />
  );
}
