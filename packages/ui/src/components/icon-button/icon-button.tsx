import { LoaderCircle } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";
import { buttonVariants, type ButtonProps } from "../button";

// Botón cuadrado con solo un ícono. Como no tiene texto visible, `label` es obligatorio y se
// usa como aria-label.
const squareSizes = {
  sm: "size-8 px-0",
  md: "size-10 px-0",
  lg: "size-11 px-0",
} as const;

export type IconButtonProps = Omit<ComponentProps<"button">, "aria-label"> &
  Pick<ButtonProps, "variant" | "size" | "loading"> & {
    label: string;
  };

export function IconButton({
  className,
  variant = "ghost",
  size = "md",
  loading = false,
  label,
  disabled,
  children,
  ...props
}: IconButtonProps) {
  return (
    <button
      data-slot="icon-button"
      aria-label={label}
      className={cn(
        buttonVariants({ variant, size }),
        squareSizes[size ?? "md"],
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <LoaderCircle
          aria-hidden="true"
          className="animate-spin motion-reduce:animate-none"
        />
      ) : (
        children
      )}
    </button>
  );
}
