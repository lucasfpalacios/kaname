"use client";

import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  type TooltipContentProps,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "../../lib/cn";
import { floatingSurface } from "../../lib/control";
import { formatMoney, type MoneyCurrency } from "../../lib/format";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../card";
import { EmptyState } from "../empty-state";
import { Skeleton } from "../skeleton";

// Gráfico de Recharts dentro de una Card. Los colores son variables CSS, así que siguen al tema
// del contenedor (claro, oscuro o .light/.dark anidados). Serie 1 = primary, serie 2 = accent
// (tokens.md). Todas las props son serializables (sin funciones) para que la web pueda usarlo
// desde un Server Component: el formato se elige con `format`.

export type ChartColor =
  "primary" | "accent" | "success" | "warning" | "destructive";

const DEFAULT_COLORS: ChartColor[] = [
  "primary",
  "accent",
  "success",
  "warning",
];

export type ChartSeries = {
  /** Clave del dato en cada fila de `data`. */
  key: string;
  label: string;
  /** Por defecto, según el orden: primary, accent, success, warning. */
  color?: ChartColor;
};

export type ChartValueFormat =
  | { style: "number" }
  | { style: "money"; currency: MoneyCurrency }
  | { style: "percent" };

export type ChartCardProps = {
  title: string;
  description?: string;
  /** Algo a la derecha del título (un Select de período, un botón). La leyenda baja al gráfico. */
  action?: ReactNode;
  /** Contenido debajo del gráfico (resúmenes, links). */
  footer?: ReactNode;
  data: Record<string, string | number>[];
  /** Clave del eje X (el mes, el día...). */
  xKey: string;
  series: ChartSeries[];
  type?: "bar" | "line" | "area";
  /** Apila las series (barras o áreas). */
  stacked?: boolean;
  format?: ChartValueFormat;
  locale?: string;
  /** Alto del gráfico en px. */
  height?: number;
  loading?: boolean;
  /** Texto cuando `data` está vacío. */
  emptyText?: string;
  className?: string;
};

const colorVar = (color: ChartColor) => `var(--${color})`;

function formatValue(
  value: unknown,
  format: ChartValueFormat,
  locale: string | undefined,
  compact: boolean,
) {
  const number = Number(value);
  if (Number.isNaN(number)) return String(value);
  if (format.style === "money") {
    return formatMoney(number, {
      currency: format.currency,
      locale,
      compact,
      hideDecimals: true,
    });
  }
  return new Intl.NumberFormat(locale, {
    style: format.style === "percent" ? "percent" : "decimal",
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(format.style === "percent" ? number / 100 : number);
}

const tick = { fill: "var(--foreground)", fillOpacity: 0.7, fontSize: 12 };

function ChartTooltip({
  active,
  payload,
  label,
  format,
  locale,
}: Partial<TooltipContentProps<number | string, string>> & {
  format: ChartValueFormat;
  locale?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className={cn(floatingSurface, "min-w-44 px-3 py-2 text-sm")}>
      <p className="mb-1.5 font-medium">{label}</p>
      <ul className="flex flex-col gap-1">
        {payload.map((item) => (
          <li key={String(item.dataKey)} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="size-2.5 shrink-0 rounded-xs"
              style={{ background: item.color }}
            />
            <span className="text-foreground/70">{item.name}</span>
            <span className="ml-auto pl-3 font-medium tabular-nums whitespace-nowrap">
              {formatValue(item.value, format, locale, false)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ChartLegend({
  series,
}: {
  series: Pick<ChartSeries, "label" | "color">[];
}) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium">
      {series.map((item, index) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="size-2.5 rounded-xs"
            style={{
              background: colorVar(
                item.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length],
              ),
            }}
          />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

export function ChartCard({
  title,
  description,
  action,
  footer,
  data,
  xKey,
  series,
  type = "bar",
  stacked = false,
  format = { style: "number" },
  locale,
  height = 280,
  loading = false,
  emptyText,
  className,
}: ChartCardProps) {
  const colored = series.map((item, index) => ({
    ...item,
    color: item.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length],
  }));
  const stackId = stacked ? "stack" : undefined;
  // Cada tipo con su gráfico: BarChart dibuja el cursor como franja y LineChart/AreaChart como línea.
  const Chart =
    type === "bar" ? BarChart : type === "line" ? LineChart : AreaChart;

  let body: ReactNode;
  if (loading) {
    body = <Skeleton className="w-full" style={{ height }} />;
  } else if (data.length === 0) {
    body = (
      <EmptyState
        variant="plain"
        title={emptyText ?? ""}
        className="justify-center"
        style={{ height }}
      />
    );
  } else {
    body = (
      <Chart
        responsive
        data={data}
        style={{ width: "100%", height }}
        margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
      >
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey={xKey}
          tick={tick}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          // Las barras ya dejan aire a los costados; la línea y el área irían de borde a borde.
          padding={type === "bar" ? undefined : { left: 16, right: 16 }}
        />
        <YAxis
          width="auto"
          tick={tick}
          tickLine={false}
          axisLine={false}
          tickMargin={4}
          tickFormatter={(value) => formatValue(value, format, locale, true)}
        />
        <Tooltip
          cursor={
            type === "bar"
              ? { fill: "var(--foreground)", fillOpacity: 0.05 }
              : { stroke: "var(--border)", strokeWidth: 1 }
          }
          content={<ChartTooltip format={format} locale={locale} />}
        />
        {colored.map((item, index) => {
          const color = colorVar(item.color);
          if (type === "line") {
            return (
              <Line
                key={item.key}
                dataKey={item.key}
                name={item.label}
                type="monotone"
                stroke={color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            );
          }
          if (type === "area") {
            return (
              <Area
                key={item.key}
                dataKey={item.key}
                name={item.label}
                type="monotone"
                stackId={stackId}
                stroke={color}
                strokeWidth={2}
                fill={color}
                fillOpacity={0.2}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            );
          }
          // Apiladas, solo la serie de arriba redondea las esquinas.
          const rounded = !stacked || index === colored.length - 1;
          return (
            <Bar
              key={item.key}
              dataKey={item.key}
              name={item.label}
              stackId={stackId}
              fill={color}
              maxBarSize={48}
              radius={rounded ? [4, 4, 0, 0] : 0}
            />
          );
        })}
      </Chart>
    );
  }

  return (
    <Card
      data-slot="chart-card"
      aria-busy={loading || undefined}
      className={cn("min-w-0", className)}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        <CardAction>{action ?? <ChartLegend series={colored} />}</CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {action && <ChartLegend series={colored} />}
        {body}
      </CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}
