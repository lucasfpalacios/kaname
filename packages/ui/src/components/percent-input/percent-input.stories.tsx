import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { storyMessages } from "../../stories/messages";
import {
  forcedStates,
  StoryRow,
  storyIntlLocale,
} from "../../stories/story-row";
import { ThemePanels } from "../../stories/theme-panels";
import { PercentInput } from "./percent-input";

const meta = {
  title: "Formularios/PercentInput",
  component: PercentInput,
} satisfies Meta<typeof PercentInput>;

export default meta;

// Los props los arma cada render (con estado), no los controles de Storybook.
type Story = StoryObj;

function Margin({
  locale,
  initial = null,
  className,
  ...props
}: {
  locale: unknown;
  initial?: string | null;
  className?: string;
  disabled?: boolean;
  allowNegative?: boolean;
  "aria-invalid"?: boolean;
}) {
  const f = storyMessages(locale).form;
  const [value, setValue] = useState<string | null>(initial);
  return (
    <PercentInput
      aria-label={f.margin}
      value={value}
      onValueChange={setValue}
      locale={storyIntlLocale(locale)}
      className={`max-w-32 ${className ?? ""}`}
      {...props}
    />
  );
}

export const Estados: Story = {
  parameters: forcedStates,
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    const locale = globals.locale;
    return (
      <ThemePanels labels={t}>
        <div className="flex flex-col gap-3">
          <StoryRow label={t.states.empty}>
            <Margin locale={locale} />
          </StoryRow>
          <StoryRow label={t.states.default}>
            <Margin locale={locale} initial="35" />
            <Margin locale={locale} initial="10.5" />
          </StoryRow>
          <StoryRow label={t.states.focus}>
            <Margin
              locale={locale}
              initial="35"
              className="force-focus-within"
            />
          </StoryRow>
          <StoryRow label={t.states.disabled}>
            <Margin locale={locale} initial="21" disabled />
          </StoryRow>
          <StoryRow label={t.states.error}>
            <Margin locale={locale} initial="-5" allowNegative aria-invalid />
          </StoryRow>
        </div>
      </ThemePanels>
    );
  },
};
