import type { Meta, StoryObj } from "@storybook/react-vite";
import { storyMessages } from "../../stories/messages";
import { ThemePanels } from "../../stories/theme-panels";
import { Skeleton } from "./skeleton";

const meta = {
  title: "Componentes/Skeleton",
  component: Skeleton,
} satisfies Meta<typeof Skeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Formas: Story = {
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    return (
      <ThemePanels labels={t}>
        <div className="flex flex-col gap-6" aria-busy="true">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {[0, 1, 2].map((row) => (
              <Skeleton key={row} className="h-10 w-full" />
            ))}
          </div>
        </div>
      </ThemePanels>
    );
  },
};
