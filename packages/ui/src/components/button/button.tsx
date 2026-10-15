import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";
import { Slot } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";
import { focusRing } from "../../lib/focus-ring";

// Adaptado de shadcn/ui. destructive usa text-background: casi blanco en claro y Kon-iro en
// oscuro, así el texto pasa AA sobre los dos rojos.
export const buttonVariants = cva(
  [
    "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md font-sans font-medium whitespace-nowrap transition-colors select-none",
    "disabled:pointer-events-none disabled:opacity-50 aria-busy:cursor-progress",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
    focusRing,
  ],
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary:
          "border border-border bg-card text-foreground hover:bg-foreground/8",
        ghost: "text-foreground hover:bg-foreground/8",
        destructive: "bg-destructive text-background hover:bg-destructive/90",
      },
      size: {
        sm: "h-8 px-3 text-sm [&_svg:not([class*='size-'])]:size-4",
        md: "h-10 px-4 text-sm [&_svg:not([class*='size-'])]:size-4",
        lg: "h-11 px-5 text-base [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    /** Renderiza el hijo (por ejemplo un link) con los estilos del botón. */
    asChild?: boolean;
    /** Muestra un spinner, deshabilita el botón y marca aria-busy. */
    loading?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <LoaderCircle
          aria-hidden="true"
          className="animate-spin motion-reduce:animate-none"
        />
      )}
      <Slot.Slottable>{children}</Slot.Slottable>
    </Comp>
  );
}
