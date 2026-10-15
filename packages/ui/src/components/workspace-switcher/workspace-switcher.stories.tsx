import type { Meta, StoryObj } from "@storybook/react-vite";
import { Plus } from "lucide-react";
import { switcherItems } from "../../stories/app-frame";
import { storyMessages } from "../../stories/messages";
import { DropdownMenuItem } from "../dropdown-menu";
import { WorkspaceSwitcher } from "./workspace-switcher";

const meta = {
  title: "Layout/WorkspaceSwitcher",
  component: WorkspaceSwitcher,
  args: { workspaces: [], currentId: "", label: "" },
} satisfies Meta<typeof WorkspaceSwitcher>;

export default meta;

type Story = StoryObj<typeof meta>;

// Cada espacio con su color; el actual lleva un check. Abrilo para ver la lista.
export const Playground: Story = {
  render: (_args, { globals }) => {
    const s = storyMessages(globals.locale).shell;
    return (
      <div className="h-96 w-64">
        <WorkspaceSwitcher
          workspaces={switcherItems(globals.locale)}
          currentId="tank-vault"
          label={s.switchWorkspace}
          groupLabel={s.workspaces}
          onSelect={() => undefined}
          footer={
            <DropdownMenuItem>
              <Plus />
              {s.newWorkspace}
            </DropdownMenuItem>
          }
        />
      </div>
    );
  },
};
