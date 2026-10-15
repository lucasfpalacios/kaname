import type { Meta, StoryObj } from "@storybook/react-vite";
import { Truck } from "lucide-react";
import { storyMessages } from "../../stories/messages";
import { storyIntlLocale } from "../../stories/story-row";
import {
  averageTicket,
  monthlyImports,
  monthlySales,
} from "../../stories/tank-vault";
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

function SalesChart({
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

// Ventas de Tank Vault: barras apiladas, serie 1 en primary y serie 2 en accent.
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
