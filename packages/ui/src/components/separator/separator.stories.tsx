import type { Meta, StoryObj } from "@storybook/react-vite";
import { storyMessages } from "../../stories/messages";
import { ThemePanels } from "../../stories/theme-panels";
import { Separator } from "./separator";

const meta = {
  title: "Componentes/Separator",
  component: Separator,
} satisfies Meta<typeof Separator>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Orientaciones: Story = {
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    return (
      <ThemePanels labels={t}>
        <div className="flex max-w-sm flex-col gap-4">
          <div>
            <p className="font-medium">{t.card.title}</p>
            <p className="text-sm text-foreground/70">{t.card.description}</p>
          </div>
          <Separator />
          <div className="flex h-5 items-center gap-4 text-sm">
            <span>{t.actions.edit}</span>
            <Separator orientation="vertical" />
            <span>{t.actions.viewAll}</span>
            <Separator orientation="vertical" />
            <span>{t.actions.delete}</span>
          </div>
        </div>
      </ThemePanels>
    );
  },
};
