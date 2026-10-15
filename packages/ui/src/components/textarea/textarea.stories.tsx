import type { Meta, StoryObj } from "@storybook/react-vite";
import { storyMessages } from "../../stories/messages";
import { forcedStates, StoryRow } from "../../stories/story-row";
import { ThemePanels } from "../../stories/theme-panels";
import { Textarea } from "./textarea";

const meta = {
  title: "Formularios/Textarea",
  component: Textarea,
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Estados: Story = {
  parameters: forcedStates,
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    const label = t.form.description;
    const text = t.form.descriptionHelp;
    return (
      <ThemePanels labels={t}>
        <div className="flex flex-col gap-3">
          <StoryRow label={t.states.empty}>
            <Textarea
              aria-label={label}
              placeholder={text}
              className="max-w-72"
            />
          </StoryRow>
          <StoryRow label={t.states.focus}>
            <Textarea
              aria-label={label}
              defaultValue={text}
              className="force-focus max-w-72"
            />
          </StoryRow>
          <StoryRow label={t.states.disabled}>
            <Textarea
              aria-label={label}
              defaultValue={text}
              disabled
              className="max-w-72"
            />
          </StoryRow>
          <StoryRow label={t.states.error}>
            <Textarea
              aria-label={label}
              aria-invalid
              defaultValue={text}
              className="max-w-72"
            />
          </StoryRow>
        </div>
      </ThemePanels>
    );
  },
};
