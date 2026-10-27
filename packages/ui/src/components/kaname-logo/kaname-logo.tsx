import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

// Logo: el 要 (el remache del abanico) en un cuadrado primario y, al lado o debajo, el nombre.
// El kanji es decorativo; el nombre es el texto del logo.
const logoVariants = cva("inline-flex items-center font-display", {
  variants: {
    size: {
      sm: "gap-2 text-lg",
      md: "gap-2.5 text-xl",
      lg: "flex-col gap-3 text-2xl",
    },
  },
  defaultVariants: { size: "md" },
});

const markVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-md bg-primary font-semibold text-primary-foreground",
  {
    variants: {
      size: {
        sm: "size-8 text-lg",
        md: "size-9 text-xl",
        lg: "size-14 text-3xl",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export type KanameLogoProps = Omit<ComponentProps<"span">, "children"> &
  VariantProps<typeof logoVariants> & {
    /** Nombre del producto ("Kaname"). */
    name: string;
    /** Solo el 要, sin el nombre visible (el nombre queda como aria-label). */
    markOnly?: boolean;
  };

export function KanameLogo({
  name,
  size,
  markOnly = false,
  className,
  ...props
}: KanameLogoProps) {
  return (
    <span
      data-slot="kaname-logo"
      className={cn(logoVariants({ size }), className)}
      {...(markOnly ? { role: "img", "aria-label": name } : {})}
      {...props}
    >
      <span aria-hidden="true" lang="ja" className={markVariants({ size })}>
        要
      </span>
      {!markOnly && <span className="leading-none font-extrabold">{name}</span>}
    </span>
  );
}
