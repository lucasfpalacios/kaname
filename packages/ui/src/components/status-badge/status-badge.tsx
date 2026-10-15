import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";
import { Badge } from "../badge";

// Badge de estado con un punto de color. El texto entra por `label` (la web lo traduce); el color
// sale del tono. Como en Badge, el texto va en foreground: el punto y el borde llevan el color.
export type StatusTone =
  "neutral" | "info" | "accent" | "success" | "warning" | "danger";

const tones = {
  neutral: { variant: "secondary", dot: "bg-foreground/50" },
  info: { variant: "info", dot: "bg-primary" },
  accent: { variant: "accent", dot: "bg-accent" },
  success: { variant: "success", dot: "bg-success" },
  warning: { variant: "warning", dot: "bg-warning" },
  danger: { variant: "destructive", dot: "bg-destructive" },
} as const satisfies Record<StatusTone, { variant: string; dot: string }>;

export type StatusBadgeProps = Omit<ComponentProps<"span">, "children"> & {
  tone?: StatusTone;
  label: string;
};

export function StatusBadge({
  tone = "neutral",
  label,
  className,
  ...props
}: StatusBadgeProps) {
  return (
    <Badge
      data-slot="status-badge"
      variant={tones[tone].variant}
      className={cn("gap-1.5", className)}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn("size-1.5 shrink-0 rounded-full", tones[tone].dot)}
      />
      {label}
    </Badge>
  );
}

// Mismos valores que OrderStatus y PaymentStatus del dominio. El kit los declara para no depender
// de @kaname/shared (igual que ModuleKanji); la web le pasa `order.status` directo.
export type OrderStatusKey =
  | "DRAFT"
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatusKey = "UNPAID" | "PARTIAL" | "PAID" | "REFUNDED";

export const orderStatusTone: Record<OrderStatusKey, StatusTone> = {
  DRAFT: "neutral",
  PENDING: "accent",
  CONFIRMED: "info",
  PREPARING: "warning",
  SHIPPED: "info",
  DELIVERED: "success",
  CANCELLED: "danger",
};

export const paymentStatusTone: Record<PaymentStatusKey, StatusTone> = {
  UNPAID: "warning",
  PARTIAL: "accent",
  PAID: "success",
  REFUNDED: "neutral",
};

type DomainStatusBadgeProps<K> = Omit<StatusBadgeProps, "tone"> & {
  status: K;
};

export function OrderStatusBadge({
  status,
  ...props
}: DomainStatusBadgeProps<OrderStatusKey>) {
  return <StatusBadge tone={orderStatusTone[status]} {...props} />;
}

export function PaymentStatusBadge({
  status,
  ...props
}: DomainStatusBadgeProps<PaymentStatusKey>) {
  return <StatusBadge tone={paymentStatusTone[status]} {...props} />;
}
