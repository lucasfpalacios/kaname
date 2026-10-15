import type { Meta, StoryObj } from "@storybook/react-vite";
import { Undo2 } from "lucide-react";
import { storyMessages } from "../../stories/messages";
import { storyIntlLocale } from "../../stories/story-row";
import { TankVaultKpis } from "../../stories/tank-vault-widgets";
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
