import type { Meta, StoryObj } from "@storybook/react-vite";
import { LayoutGrid } from "lucide-react";
import { fill } from "../../stories/app-frame";
import { storyMessages } from "../../stories/messages";
import { forcedStates } from "../../stories/story-row";
import { ThemePanels } from "../../stories/theme-panels";
import { workspaces } from "../../stories/workspaces";
import { WorkspaceTile } from "./workspace-tile";

const meta = {
  title: "Layout/WorkspaceTile",
  component: WorkspaceTile,
  args: {
    name: "Tank Vault TCG",
    description: "Emprendimiento",
    initials: "TV",
  },
} satisfies Meta<typeof WorkspaceTile>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

// General seleccionado, un espacio con hover forzado, uno con foco, el resto normal y "crear".
export const Variantes: Story = {
  parameters: forcedStates,
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    const s = t.shell;
    return (
      <ThemePanels labels={t}>
        <div className="grid gap-4 sm:grid-cols-2">
          <WorkspaceTile
            selected
            name={s.general}
            description={s.generalDescription}
            icon={<LayoutGrid />}
            badge={s.global}
          />
          {workspaces.map((workspace, index) => (
            <WorkspaceTile
              key={workspace.id}
              className={
                index === 0
                  ? "force-hover"
                  : index === 1
                    ? "force-focus"
                    : undefined
              }
              name={workspace.name}
              description={s.types[workspace.type]}
              initials={workspace.initials}
              color={workspace.color}
              badge={fill(s.pending, { count: workspace.pending })}
            />
          ))}
          <WorkspaceTile
            variant="create"
            name={s.createWorkspace}
            description={s.createWorkspaceDescription}
          />
        </div>
      </ThemePanels>
    );
  },
};
