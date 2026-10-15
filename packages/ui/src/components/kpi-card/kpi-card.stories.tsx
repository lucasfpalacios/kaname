import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Banknote,
  ClipboardList,
  PackageCheck,
  PieChart,
  Undo2,
} from "lucide-react";
import { storyMessages } from "../../stories/messages";
import { storyIntlLocale } from "../../stories/story-row";
import { ThemePanels } from "../../stories/theme-panels";
import { MoneyText } from "../money-text";
import { KpiCard } from "./kpi-card";

const meta = {
  title: "Datos/KpiCard",
  component: KpiCard,
  args: { label: "", value: "" },
} satisfies Meta<typeof KpiCard>;

export default meta;

type Story = StoryObj<typeof meta>;

// Los KPIs de la cabecera de Tank Vault.
function TankVaultKpis({
  locale: storyLocale,
  loading,
}: {
  locale: unknown;
  loading?: boolean;
}) {
  const k = storyMessages(storyLocale).data.kpis;
  const locale = storyIntlLocale(storyLocale);
  const number = new Intl.NumberFormat(locale);
  return (
    <div className="grid gap-4 sm:grid-cols-2">
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

export const TankVault: Story = {
  render: (_args, { globals }) => (
    <ThemePanels labels={storyMessages(globals.locale)}>
      <TankVaultKpis locale={globals.locale} />
    </ThemePanels>
  ),
};

// Ventas que bajan (rojo), devoluciones que bajan con invert (verde) y sin variación (neutro).
export const Variaciones: Story = {
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    const k = t.data.kpis;
    const locale = storyIntlLocale(globals.locale);
    return (
      <ThemePanels labels={t}>
        <div className="grid gap-4 sm:grid-cols-3">
          <KpiCard
            label={k.sales}
            value={
              <MoneyText
                value="3950000"
                currency="ARS"
                locale={locale}
                hideDecimals
              />
            }
            change={{ value: "-8.4", label: k.vsLastMonth }}
            locale={locale}
          />
          <KpiCard
            label={k.returns}
            icon={<Undo2 />}
            value="3"
            change={{ value: "-40", label: k.vsLastMonth, invert: true }}
            locale={locale}
          />
          <KpiCard
            label={k.pending}
            value={`8 ${k.orders}`}
            change={{ value: "0", label: k.vsLastMonth }}
            locale={locale}
          />
        </div>
      </ThemePanels>
    );
  },
};

export const Cargando: Story = {
  render: (_args, { globals }) => (
    <ThemePanels labels={storyMessages(globals.locale)}>
      <TankVaultKpis locale={globals.locale} loading />
    </ThemePanels>
  ),
};
