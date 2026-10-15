import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { storyMessages } from "../../stories/messages";
import { storyIntlLocale } from "../../stories/story-row";
import { ThemePanels } from "../../stories/theme-panels";
import { Calendar } from "./calendar";

const meta = {
  title: "Formularios/Calendar",
  component: Calendar,
} satisfies Meta<typeof Calendar>;

export default meta;

type Story = StoryObj<typeof meta>;

function SingleCalendar({ locale }: { locale: unknown }) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  return (
    <Calendar
      mode="single"
      locale={storyIntlLocale(locale)}
      selected={date}
      onSelect={setDate}
      disabled={{ dayOfWeek: [0] }}
      className="rounded-lg border border-border bg-card"
    />
  );
}

export const Simple: Story = {
  render: (_args, { globals }) => (
    <ThemePanels labels={storyMessages(globals.locale)}>
      <SingleCalendar locale={globals.locale} />
    </ThemePanels>
  ),
};
