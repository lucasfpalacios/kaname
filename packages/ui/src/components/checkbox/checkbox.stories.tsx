import type { Meta, StoryObj } from "@storybook/react-vite";
import { storyMessages } from "../../stories/messages";
import { forcedStates, StoryRow } from "../../stories/story-row";
import { ThemePanels } from "../../stories/theme-panels";
import { Label } from "../label";
import { Checkbox } from "./checkbox";

const meta = {
  title: "Formularios/Checkbox",
  component: Checkbox,
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Estados: Story = {
  parameters: forcedStates,
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    const label = t.form.terms;
    return (
      <ThemePanels labels={t}>
        <div className="flex flex-col gap-3">
          <StoryRow label={t.states.empty}>
            <Checkbox aria-label={label} />
          </StoryRow>
          <StoryRow label={t.states.default}>
            <Checkbox aria-label={label} defaultChecked />
            <Checkbox aria-label={label} checked="indeterminate" />
          </StoryRow>
          <StoryRow label={t.states.focus}>
            <Checkbox
              aria-label={label}
              defaultChecked
              className="force-focus"
            />
          </StoryRow>
          <StoryRow label={t.states.disabled}>
            <Checkbox aria-label={label} disabled />
            <Checkbox aria-label={label} disabled defaultChecked />
          </StoryRow>
          <StoryRow label={t.states.error}>
            <Checkbox aria-label={label} aria-invalid />
          </StoryRow>
        </div>
      </ThemePanels>
    );
  },
};

export const ConLabel: Story = {
  name: "Con label",
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    return (
      <div className="flex items-center gap-2">
        <Checkbox id="terms" />
        <Label htmlFor="terms">{t.form.terms}</Label>
      </div>
    );
  },
};
