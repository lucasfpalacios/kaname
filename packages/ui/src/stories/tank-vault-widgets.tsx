import {
  Banknote,
  ClipboardList,
  PackageCheck,
  PieChart,
  Truck,
} from "lucide-react";
import { ChartCard } from "../components/chart-card";
import { KpiCard } from "../components/kpi-card";
import { MoneyText } from "../components/money-text";
import { cn } from "../lib/cn";
import { storyMessages } from "./messages";
import { storyIntlLocale } from "./story-row";
import { monthlySales } from "./tank-vault";

// Piezas de Tank Vault que usan varias stories: las de KpiCard y ChartCard y la pantalla completa.

// Los KPIs de la cabecera de Tank Vault.
export function TankVaultKpis({
  locale: storyLocale,
  loading,
  className,
}: {
  locale: unknown;
  loading?: boolean;
  className?: string;
}) {
  const k = storyMessages(storyLocale).data.kpis;
  const locale = storyIntlLocale(storyLocale);
  const number = new Intl.NumberFormat(locale);
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2", className)}>
      <KpiCard
        label={k.sales}
        icon={<Banknote />}
        value={
          <MoneyText
            value="4620000"
            currency="ARS"
            locale={locale}
            hideDecimals
          />
        }
        change={{ value: "14.2", label: k.vsLastMonth }}
        locale={locale}
        loading={loading}
      />
      <KpiCard
        label={k.margin}
        icon={<PieChart />}
        value={new Intl.NumberFormat(locale, {
          style: "percent",
          maximumFractionDigits: 1,
        }).format(0.385)}
        change={{ value: "3.5", unit: k.points, label: k.marginGoal }}
        locale={locale}
        loading={loading}
      />
      <KpiCard
        label={k.stock}
        icon={<PackageCheck />}
        value={`${number.format(1420)} ${k.units}`}
        description={k.stockDetail}
        locale={locale}
        loading={loading}
      />
      <KpiCard
        label={k.pending}
        icon={<ClipboardList />}
        value={`${number.format(8)} ${k.orders}`}
        description={k.pendingDetail}
        locale={locale}
        loading={loading}
      />
    </div>
  );
}

// Ventas de los últimos 6 meses: barras (o áreas) apiladas.
export function SalesChart({
  locale: storyLocale,
  type = "bar",
  loading,
  empty,
}: {
  locale: unknown;
  type?: "bar" | "area";
  loading?: boolean;
  empty?: boolean;
}) {
  const c = storyMessages(storyLocale).data.chart;
  const data = monthlySales.map((row, index) => ({
    month: c.months[index],
    ...row,
  }));
  return (
    <ChartCard
      title={c.salesTitle}
      description={c.salesDescription}
      data={empty ? [] : data}
      xKey="month"
      series={[
        { key: "national", label: c.national },
        { key: "local", label: c.local },
      ]}
      type={type}
      stacked
      format={{ style: "money", currency: "ARS" }}
      locale={storyIntlLocale(storyLocale)}
      loading={loading}
      emptyText={c.empty}
      footer={
        <p className="flex items-center gap-2 text-sm text-foreground/70">
          <Truck aria-hidden="true" className="size-4 text-primary" />
          {c.channel}
        </p>
      }
    />
  );
}
