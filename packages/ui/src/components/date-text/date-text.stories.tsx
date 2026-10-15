import type { Meta, StoryObj } from "@storybook/react-vite";
import { storyMessages } from "../../stories/messages";
import { storyIntlLocale, StoryRow } from "../../stories/story-row";
import { TIME_ZONE } from "../../stories/tank-vault";
import { ThemePanels } from "../../stories/theme-panels";
import { DateText } from "./date-text";

const FORMATS = [
  "date",
  "short",
  "long",
  "monthYear",
  "datetime",
  "time",
  "weekdayTime",
] as const;

const meta = {
  title: "Datos/DateText",
  component: DateText,
  args: {
    value: "2026-10-15T17:32:00Z",
    format: "datetime",
    timeZone: TIME_ZONE,
  },
  argTypes: { format: { control: "inline-radio", options: FORMATS } },
} satisfies Meta<typeof DateText>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args, { globals }) => (
    <DateText {...args} locale={storyIntlLocale(globals.locale)} />
  ),
};

// Pedido #TK-1084, cargado el 15/10 a las 14:32 (hora de Buenos Aires).
export const Formatos: Story = {
  render: (_args, { globals }) => (
    <ThemePanels labels={storyMessages(globals.locale)}>
      <div className="flex flex-col gap-3">
        {FORMATS.map((format) => (
          <StoryRow key={format} label={format}>
            <DateText
              value="2026-10-15T17:32:00Z"
              format={format}
              locale={storyIntlLocale(globals.locale)}
              timeZone={TIME_ZONE}
            />
          </StoryRow>
        ))}
      </div>
    </ThemePanels>
  ),
};

// Una fecha sin hora es un día del calendario: no se corre al día anterior por la zona horaria.
export const FechaSinHora: Story = {
  name: "Fecha sin hora",
  render: (_args, { globals }) => (
    <DateText
      value="2026-10-26"
      format="long"
      locale={storyIntlLocale(globals.locale)}
      timeZone={TIME_ZONE}
    />
  ),
};
