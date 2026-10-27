import type { Meta, StoryObj } from "@storybook/react-vite";
import { storyMessages } from "../../stories/messages";
import { StoryRow } from "../../stories/story-row";
import { ThemePanels } from "../../stories/theme-panels";
import { KanameLogo } from "./kaname-logo";

const SIZES = ["sm", "md", "lg"] as const;

const meta = {
  title: "Layout/KanameLogo",
  component: KanameLogo,
  args: { name: "Kaname", size: "md" },
  argTypes: { size: { control: "inline-radio", options: SIZES } },
} satisfies Meta<typeof KanameLogo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Tamaños: Story = {
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    return (
      <ThemePanels labels={t}>
        <div className="flex flex-col gap-6">
          {SIZES.map((size) => (
            <StoryRow key={size} label={size}>
              <KanameLogo name={t.auth.product} size={size} />
              <KanameLogo name={t.auth.product} size={size} markOnly />
            </StoryRow>
          ))}
        </div>
      </ThemePanels>
    );
  },
};
