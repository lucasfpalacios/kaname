import type { Meta, StoryObj } from "@storybook/react-vite";
import { storyMessages } from "../../stories/messages";
import { storyIntlLocale } from "../../stories/story-row";
import { averageTicket, monthlyImports } from "../../stories/tank-vault";
import { SalesChart } from "../../stories/tank-vault-widgets";
import { ThemePanels } from "../../stories/theme-panels";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";
import { ChartCard } from "./chart-card";

const meta = {
  title: "Datos/ChartCard",
  component: ChartCard,
  args: { title: "", data: [], xKey: "month", series: [] },
} satisfies Meta<typeof ChartCard>;

export default meta;

type Story = StoryObj<typeof meta>;

// Ventas de Tank Vault: barras apiladas, serie 1 en --chart-1 y serie 2 en --chart-2.
export const VentasApiladas: Story = {
  name: "Ventas apiladas",
  render: (_args, { globals }) => (
    <ThemePanels labels={storyMessages(globals.locale)}>
      <SalesChart locale={globals.locale} />
    </ThemePanels>
  ),
};

export const Areas: Story = {
  name: "Áreas",
  render: (_args, { globals }) => (
    <ThemePanels labels={storyMessages(globals.locale)}>
      <SalesChart locale={globals.locale} type="area" />
    </ThemePanels>
  ),
};

export const Linea: Story = {
  name: "Línea",
  render: (_args, { globals }) => {
    const c = storyMessages(globals.locale).data.chart;
    return (
      <ThemePanels labels={storyMessages(globals.locale)}>
        <ChartCard
          title={c.ticketTitle}
          description={c.ticketDescription}
          data={averageTicket.map((ticket, index) => ({
            month: c.months[index],
            ticket,
          }))}
          xKey="month"
          series={[{ key: "ticket", label: c.ticketTitle }]}
          type="line"
          format={{ style: "money", currency: "ARS" }}
          locale={storyIntlLocale(globals.locale)}
          height={220}
        />
      </ThemePanels>
    );
  },
};

// Barras agrupadas en USD, con un Select en lugar de la leyenda (la leyenda baja al gráfico).
export const ConAccion: Story = {
  name: "Con acción",
  render: (_args, { globals }) => {
    const c = storyMessages(globals.locale).data.chart;
    return (
      <ChartCard
        title={c.importsTitle}
        description={c.importsDescription}
        action={
          <Select defaultValue="6m">
            <SelectTrigger aria-label={c.period} className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6m">{c.period}</SelectItem>
            </SelectContent>
          </Select>
        }
        data={monthlyImports.map((row, index) => ({
          month: c.months[index],
          ...row,
        }))}
        xKey="month"
        series={[
          { key: "sealed", label: c.sealed },
          { key: "singles", label: c.singles },
        ]}
        format={{ style: "money", currency: "USD" }}
        locale={storyIntlLocale(globals.locale)}
      />
    );
  },
};

export const CargandoYVacio: Story = {
  name: "Cargando y vacío",
  render: (_args, { globals }) => (
    <div className="flex flex-col gap-4">
      <SalesChart locale={globals.locale} loading />
      <SalesChart locale={globals.locale} empty />
    </div>
  ),
};
