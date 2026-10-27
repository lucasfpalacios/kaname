import { cva, type VariantProps } from "class-variance-authority";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "../../lib/cn";

// Aviso dentro de la página o de un formulario (por ejemplo, "Email o contraseña incorrectos").
// Como Toast y Badge: texto en foreground y el color del estado en el borde, el fondo y el ícono.
// Los errores se anuncian enseguida (role="alert"); el resto, sin interrumpir (role="status").
export const alertVariants = cva(
  "flex w-full items-start gap-3 rounded-md border border-l-4 px-4 py-3 text-sm text-foreground",
  {
    variants: {
      variant: {
        info: "border-border border-l-primary bg-card",
        success: "border-success bg-success-soft",
        warning: "border-warning bg-warning-soft",
        destructive: "border-destructive bg-destructive-soft",
      },
    },
    defaultVariants: { variant: "info" },
  },
);

type AlertVariant = NonNullable<VariantProps<typeof alertVariants>["variant"]>;

const icons = {
  info: { Icon: Info, className: "text-primary" },
  success: { Icon: CircleCheck, className: "text-success" },
  warning: { Icon: TriangleAlert, className: "text-warning" },
  destructive: { Icon: CircleAlert, className: "text-destructive" },
} satisfies Record<AlertVariant, unknown>;

export type AlertProps = Omit<ComponentProps<"div">, "title"> &
  VariantProps<typeof alertVariants> & {
    title?: ReactNode;
  };

export function Alert({
  variant,
  title,
  className,
  children,
  ...props
}: AlertProps) {
  const { Icon, className: iconClassName } = icons[variant ?? "info"];
  return (
    <div
      data-slot="alert"
      role={variant === "destructive" ? "alert" : "status"}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      <Icon
        aria-hidden="true"
        className={cn("mt-0.5 size-4 shrink-0", iconClassName)}
      />
      <div className="flex min-w-0 flex-col gap-0.5">
        {title && <p className="font-medium">{title}</p>}
        {children && <div>{children}</div>}
      </div>
    </div>
  );
}
