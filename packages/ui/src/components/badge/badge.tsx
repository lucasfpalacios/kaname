import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

// Adaptado de shadcn/ui. Las variantes de estado llevan texto en foreground sobre el fondo suave
// y el color en el borde: el verde, el ámbar y el rojo como texto no pasan AA en el tema claro.
// El rosa nunca va como texto (tokens.md).
export const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1 rounded-sm border px-2 py-0.5 text-xs font-medium whitespace-nowrap text-foreground [&_svg]:pointer-events-none [&_svg]:size-3",
  {
    variants: {
      variant: {
        primary: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-border bg-card",
        accent: "border-accent bg-accent-soft",
        success: "border-success bg-success-soft",
        warning: "border-warning bg-warning-soft",
        destructive: "border-destructive bg-destructive-soft",
      },
    },
    defaultVariants: { variant: "primary" },
  },
);

export type BadgeProps = ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean };

export function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot.Root : "span";
  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}
