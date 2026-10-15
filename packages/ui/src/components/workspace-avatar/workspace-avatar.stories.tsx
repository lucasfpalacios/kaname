import type { Meta, StoryObj } from "@storybook/react-vite";
import { LayoutGrid } from "lucide-react";
import { StoryRow } from "../../stories/story-row";
import { storyMessages } from "../../stories/messages";
import { ThemePanels } from "../../stories/theme-panels";
import { workspaces } from "../../stories/workspaces";
import { WorkspaceAvatar } from "./workspace-avatar";

const SIZES = ["sm", "md", "lg", "xl"] as const;

const meta = {
  title: "Layout/WorkspaceAvatar",
  component: WorkspaceAvatar,
  args: { initials: "TV", size: "md" },
  argTypes: { size: { control: "inline-radio", options: SIZES } },
} satisfies Meta<typeof WorkspaceAvatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const TamañosYColores: Story = {
  name: "Tamaños y colores",
  render: (_args, { globals }) => (
    <ThemePanels labels={storyMessages(globals.locale)}>
      <div className="flex flex-col gap-4">
        {SIZES.map((size) => (
          <StoryRow key={size} label={size}>
            <WorkspaceAvatar size={size} icon={<LayoutGrid />} />
            {workspaces.map((workspace) => (
              <WorkspaceAvatar
                key={workspace.id}
                size={size}
                initials={workspace.initials}
                color={workspace.color}
              />
            ))}
          </StoryRow>
        ))}
      </div>
    </ThemePanels>
  ),
};
