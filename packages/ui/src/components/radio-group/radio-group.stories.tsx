import type { Meta, StoryObj } from "@storybook/react-vite";
import { storyMessages } from "../../stories/messages";
import { forcedStates, StoryRow } from "../../stories/story-row";
import { ThemePanels } from "../../stories/theme-panels";
import { Label } from "../label";
import { RadioGroup, RadioGroupItem } from "./radio-group";

const meta = {
  title: "Formularios/RadioGroup",
  component: RadioGroup,
} satisfies Meta<typeof RadioGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

function Conditions({
  locale,
  prefix,
  ...props
}: {
  locale: unknown;
  prefix: string;
  defaultValue?: string;
  disabled?: boolean;
  "aria-invalid"?: boolean;
  focusFirst?: boolean;
}) {
  const f = storyMessages(locale).form;
  const { focusFirst, ...groupProps } = props;
  return (
    <RadioGroup
      aria-label={f.condition}
      className="grid-flow-col"
      {...groupProps}
    >
      {(["new", "used", "damaged"] as const).map((key, index) => (
        <div key={key} className="flex items-center gap-2">
          <RadioGroupItem
            id={`${prefix}-${key}`}
            value={key}
            className={focusFirst && index === 0 ? "force-focus" : undefined}
          />
          <Label htmlFor={`${prefix}-${key}`}>{f.conditions[key]}</Label>
        </div>
      ))}
    </RadioGroup>
  );
}

export const Estados: Story = {
  parameters: forcedStates,
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    const locale = globals.locale;
    return (
      <ThemePanels labels={t}>
        <div className="flex flex-col gap-4">
          <StoryRow label={t.states.empty}>
            <Conditions locale={locale} prefix="empty" />
          </StoryRow>
          <StoryRow label={t.states.default}>
            <Conditions locale={locale} prefix="default" defaultValue="new" />
          </StoryRow>
          <StoryRow label={t.states.focus}>
            <Conditions
              locale={locale}
              prefix="focus"
              defaultValue="new"
              focusFirst
            />
          </StoryRow>
          <StoryRow label={t.states.disabled}>
            <Conditions
              locale={locale}
              prefix="disabled"
              defaultValue="new"
              disabled
            />
          </StoryRow>
          <StoryRow label={t.states.error}>
            <Conditions locale={locale} prefix="error" aria-invalid />
          </StoryRow>
        </div>
      </ThemePanels>
    );
  },
};
