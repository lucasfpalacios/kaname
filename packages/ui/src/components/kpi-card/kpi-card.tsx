import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "../../lib/cn";
import { formatChange } from "../../lib/format";
import { Badge } from "../badge";
import { Card } from "../card";
import { Skeleton } from "../skeleton";

export type KpiChange = {
  /** Variación como string decimal ("14.2", "-2.1"). */
  value: string;
  /** Sin unidad es un porcentaje; con unidad se muestra al lado ("pp"). */
  unit?: string;
  /** Texto de comparación ("vs mes anterior"). */
  label?: string;
  /** true si bajar es bueno (costos, devoluciones): invierte el color. */
  invert?: boolean;
};

export type KpiCardProps = Omit<ComponentProps<"div">, "children"> & {
  label: string;
  /** El valor ya formateado: un MoneyText, un número con su unidad, etc. */
  value: ReactNode;
  /** Ícono de lucide. Es decorativo. */
  icon?: ReactNode;
  change?: KpiChange;
  /** Detalle debajo del valor ("34 líneas de producto activas"). */
  description?: string;
  locale?: string;
  loading?: boolean;
};

// La flecha y el signo dicen la dirección; el color dice si es bueno o malo, nunca solo.
function ChangeBadge({
  change,
  locale,
}: {
  change: KpiChange;
  locale?: string;
}) {
  const sign = Math.sign(Number(change.value));
  const good = change.invert ? sign < 0 : sign > 0;
  const Icon = sign > 0 ? ArrowUp : sign < 0 ? ArrowDown : Minus;
  return (
    <Badge
      variant={sign === 0 ? "secondary" : good ? "success" : "destructive"}
      className="tabular-nums"
    >
      <Icon aria-hidden="true" />
      {formatChange(change.value, { locale, unit: change.unit })}
    </Badge>
  );
}

export function KpiCard({
  label,
  value,
  icon,
  change,
  description,
  locale,
  loading = false,
  className,
  ...props
}: KpiCardProps) {
  return (
    <Card
      data-slot="kpi-card"
      aria-busy={loading || undefined}
      className={cn("min-w-0 gap-2 px-5 py-5", className)}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium tracking-label text-foreground/70 uppercase">
          {label}
        </p>
        {icon && (
          <span
            aria-hidden="true"
            className="shrink-0 text-primary [&_svg]:size-5"
          >
            {icon}
          </span>
        )}
      </div>
      {loading ? (
        <>
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-5 w-28" />
        </>
      ) : (
        <>
          <div className="text-2xl leading-tight font-bold tabular-nums whitespace-nowrap">
            {value}
          </div>
          {(change || description) && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-foreground/70">
              {change && <ChangeBadge change={change} locale={locale} />}
              {change?.label && <span>{change.label}</span>}
              {description && <span>{description}</span>}
            </div>
          )}
        </>
      )}
    </Card>
  );
}
