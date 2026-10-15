import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "../../lib/cn";

// Estado vacío de una lista, tabla o gráfico. `dashed` va suelto en la página; `plain` va dentro
// de algo que ya tiene borde (una Card, un ChartCard).
export const emptyStateVariants = cva(
  "flex flex-col items-center justify-center gap-3 px-6 py-10 text-center text-foreground",
  {
    variants: {
      variant: {
        dashed: "rounded-lg border border-dashed border-border",
        plain: "",
      },
    },
    defaultVariants: { variant: "dashed" },
  },
);

export type EmptyStateProps = Omit<ComponentProps<"div">, "title"> &
  VariantProps<typeof emptyStateVariants> & {
    /** Ícono de lucide. Es decorativo. */
    icon?: ReactNode;
    title: string;
    description?: string;
    /** Botones para salir del vacío ("Nuevo producto"). */
    action?: ReactNode;
  };

export function EmptyState({
  variant,
  icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(emptyStateVariants({ variant }), className)}
      {...props}
    >
      {icon && (
        <div
          aria-hidden="true"
          className="flex size-12 items-center justify-center rounded-full bg-accent-soft text-primary [&_svg]:size-6"
        >
          {icon}
        </div>
      )}
      <div className="flex max-w-sm flex-col gap-1">
        <p className="font-medium">{title}</p>
        {description && (
          <p className="text-sm text-foreground/70">{description}</p>
        )}
      </div>
      {action && (
        <div className="mt-1 flex flex-wrap justify-center gap-2">{action}</div>
      )}
    </div>
  );
}
