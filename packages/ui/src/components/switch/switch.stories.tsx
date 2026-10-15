import type { Meta, StoryObj } from "@storybook/react-vite";
import { storyMessages } from "../../stories/messages";
import { forcedStates, StoryRow } from "../../stories/story-row";
import { ThemePanels } from "../../stories/theme-panels";
import { Label } from "../label";
import { Switch } from "./switch";

const meta = {
  title: "Formularios/Switch",
  component: Switch,
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Estados: Story = {
  parameters: forcedStates,
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    const label = t.form.trackStock;
    return (
      <ThemePanels labels={t}>
        <div className="flex flex-col gap-3">
          <StoryRow label={t.states.default}>
            <Switch aria-label={label} />
            <Switch aria-label={label} defaultChecked />
          </StoryRow>
          <StoryRow label={t.states.focus}>
            <Switch aria-label={label} defaultChecked className="force-focus" />
          </StoryRow>
          <StoryRow label={t.states.disabled}>
            <Switch aria-label={label} disabled />
            <Switch aria-label={label} disabled defaultChecked />
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
      <div className="flex items-center gap-3">
        <Switch id="track-stock" defaultChecked />
        <Label htmlFor="track-stock">{t.form.trackStock}</Label>
      </div>
    );
  },
};
