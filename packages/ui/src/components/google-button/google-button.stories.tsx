import type { Meta, StoryObj } from "@storybook/react-vite";
import { storyMessages } from "../../stories/messages";
import { forcedStates, StoryRow } from "../../stories/story-row";
import { ThemePanels } from "../../stories/theme-panels";
import { LabeledSeparator } from "../separator";
import { GoogleButton } from "./google-button";

const meta = {
  title: "Formularios/GoogleButton",
  component: GoogleButton,
  args: { label: "", href: "#" },
} satisfies Meta<typeof GoogleButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args, { globals }) => (
    <div className="max-w-sm">
      <GoogleButton
        {...args}
        label={storyMessages(globals.locale).auth.continueWithGoogle}
      />
    </div>
  ),
};

// Normal, hover y con foco, en claro y oscuro. En el login va debajo del formulario, separado
// por "o".
export const Estados: Story = {
  parameters: forcedStates,
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    const label = t.auth.continueWithGoogle;
    return (
      <ThemePanels labels={t}>
        <div className="flex max-w-sm flex-col gap-3">
          <StoryRow label={t.states.default}>
            <GoogleButton href="#" label={label} />
          </StoryRow>
          <StoryRow label={t.states.hover}>
            <GoogleButton href="#" label={label} className="force-hover" />
          </StoryRow>
          <StoryRow label={t.states.focus}>
            <GoogleButton href="#" label={label} className="force-focus" />
          </StoryRow>
          <LabeledSeparator>{t.auth.or}</LabeledSeparator>
        </div>
      </ThemePanels>
    );
  },
};
