import type { Meta, StoryObj } from "@storybook/react-vite";
import { storyMessages } from "../../stories/messages";
import { storyIntlLocale, StoryRow } from "../../stories/story-row";
import { ThemePanels } from "../../stories/theme-panels";
import { MoneyText } from "./money-text";

const meta = {
  title: "Datos/MoneyText",
  component: MoneyText,
  args: {
    value: "4620000",
    currency: "ARS",
    hideDecimals: false,
    compact: false,
  },
  argTypes: { currency: { control: "inline-radio", options: ["ARS", "USD"] } },
} satisfies Meta<typeof MoneyText>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args, { globals }) => (
    <MoneyText {...args} locale={storyIntlLocale(globals.locale)} />
  ),
};

export const Variantes: Story = {
  render: (_args, { globals }) => {
    const m = storyMessages(globals.locale).data.money;
    const locale = storyIntlLocale(globals.locale);
    return (
      <ThemePanels labels={storyMessages(globals.locale)}>
        <div className="flex flex-col gap-3">
          <StoryRow label={m.ars}>
            <MoneyText value="345000" currency="ARS" locale={locale} />
          </StoryRow>
          <StoryRow label={m.usd}>
            <MoneyText value="1234.5" currency="USD" locale={locale} />
          </StoryRow>
          <StoryRow label={m.noDecimals}>
            <MoneyText
              value="4620000"
              currency="ARS"
              locale={locale}
              hideDecimals
            />
          </StoryRow>
          <StoryRow label={m.compact}>
            <MoneyText value="4620000" currency="ARS" locale={locale} compact />
          </StoryRow>
          <StoryRow label={m.negative}>
            <MoneyText value="-92500" currency="ARS" locale={locale} />
          </StoryRow>
          <StoryRow label={m.empty}>
            <MoneyText value={null} currency="ARS" locale={locale} />
          </StoryRow>
        </div>
      </ThemePanels>
    );
  },
};

// Montos en columna: tabular-nums alinea los dígitos.
export const EnColumna: Story = {
  name: "En columna",
  render: (_args, { globals }) => (
    <div className="flex w-40 flex-col items-end gap-1 text-sm">
      {["345000", "118000", "85000", "240000", "92500"].map((value) => (
        <MoneyText
          key={value}
          value={value}
          currency="ARS"
          locale={storyIntlLocale(globals.locale)}
        />
      ))}
    </div>
  ),
};
