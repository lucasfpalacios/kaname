import type { Meta, StoryObj } from "@storybook/react-vite";
import { storyMessages } from "../../stories/messages";
import { forcedStates, StoryRow } from "../../stories/story-row";
import { ThemePanels } from "../../stories/theme-panels";
import { Input } from "./input";

const meta = {
  title: "Formularios/Input",
  component: Input,
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { placeholder: "Booster Pokémon" },
};

export const Estados: Story = {
  parameters: forcedStates,
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    const f = t.form;
    return (
      <ThemePanels labels={t}>
        <div className="flex flex-col gap-3">
          <StoryRow label={t.states.empty}>
            <Input
              aria-label={f.name}
              placeholder={f.namePlaceholder}
              className="max-w-64"
            />
          </StoryRow>
          <StoryRow label={t.states.default}>
            <Input
              aria-label={f.name}
              defaultValue="Booster Pokémon"
              className="max-w-64"
            />
          </StoryRow>
          <StoryRow label={t.states.focus}>
            <Input
              aria-label={f.name}
              defaultValue="Booster Pokémon"
              className="force-focus max-w-64"
            />
          </StoryRow>
          <StoryRow label={t.states.disabled}>
            <Input
              aria-label={f.name}
              defaultValue="Booster Pokémon"
              disabled
              className="max-w-64"
            />
          </StoryRow>
          <StoryRow label={t.states.error}>
            <Input
              aria-label={f.name}
              aria-invalid
              placeholder={f.namePlaceholder}
              className="max-w-64"
            />
          </StoryRow>
        </div>
      </ThemePanels>
    );
  },
};
