import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { storyMessages } from "../../stories/messages";
import { StoryRow, storyIntlLocale } from "../../stories/story-row";
import { ThemePanels } from "../../stories/theme-panels";
import { DatePicker } from "./date-picker";

const meta = {
  title: "Formularios/DatePicker",
  component: DatePicker,
} satisfies Meta<typeof DatePicker>;

export default meta;

// Los props los arma cada render (con estado), no los controles de Storybook.
type Story = StoryObj;

function ReleaseDate({
  locale,
  initial,
  disabled,
  invalid,
}: {
  locale: unknown;
  initial?: Date;
  disabled?: boolean;
  invalid?: boolean;
}) {
  const f = storyMessages(locale).form;
  const [date, setDate] = useState<Date | undefined>(initial);
  return (
    <DatePicker
      aria-label={f.releaseDate}
      value={date}
      onValueChange={setDate}
      placeholder={f.datePlaceholder}
      locale={storyIntlLocale(locale)}
      disabled={disabled}
      aria-invalid={invalid}
      className="max-w-64"
    />
  );
}

export const Playground: Story = {
  render: (_args, { globals }) => <ReleaseDate locale={globals.locale} />,
};

export const Estados: Story = {
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    const locale = globals.locale;
    const sample = new Date(2026, 9, 15);
    return (
      <ThemePanels labels={t}>
        <div className="flex flex-col gap-3">
          <StoryRow label={t.states.empty}>
            <ReleaseDate locale={locale} />
          </StoryRow>
          <StoryRow label={t.states.default}>
            <ReleaseDate locale={locale} initial={sample} />
          </StoryRow>
          <StoryRow label={t.states.disabled}>
            <ReleaseDate locale={locale} initial={sample} disabled />
          </StoryRow>
          <StoryRow label={t.states.error}>
            <ReleaseDate locale={locale} invalid />
          </StoryRow>
        </div>
      </ThemePanels>
    );
  },
};
