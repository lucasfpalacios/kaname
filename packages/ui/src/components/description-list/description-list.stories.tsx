import type { Meta, StoryObj } from "@storybook/react-vite";
import { storyMessages } from "../../stories/messages";
import { ThemePanels } from "../../stories/theme-panels";
import { MoneyText } from "../money-text";
import { StatusBadge } from "../status-badge";
import { DescriptionList } from "./description-list";

const meta = {
  title: "Datos/DescriptionList",
  component: DescriptionList,
  args: { items: [] },
} satisfies Meta<typeof DescriptionList>;

export default meta;

type Story = StoryObj<typeof meta>;

// La ficha técnica del detalle de producto de Stitch: textos, montos y un badge como valor.
export const FichaDeProducto: Story = {
  name: "Ficha de producto",
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    const s = t.shell;
    return (
      <ThemePanels labels={t}>
        <DescriptionList
          className="max-w-sm"
          items={[
            { term: s.dlCategory, description: "Booster Boxes" },
            {
              term: s.dlStock,
              description: <StatusBadge tone="warning" label={s.dlLow} />,
            },
            { term: s.dlReorder, description: "10 u." },
            {
              term: s.dlCost,
              description: <MoneyText value="135" currency="USD" />,
            },
          ]}
        />
      </ThemePanels>
    );
  },
};
