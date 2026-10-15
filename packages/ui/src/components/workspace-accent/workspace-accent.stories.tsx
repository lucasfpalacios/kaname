import type { Meta, StoryObj } from "@storybook/react-vite";
import { storyMessages } from "../../stories/messages";
import { ThemePanels } from "../../stories/theme-panels";
import { workspaces } from "../../stories/workspaces";
import { Badge } from "../badge";
import { ModuleKanji } from "../module-kanji";
import { StatusBadge } from "../status-badge";
import { WorkspaceAvatar } from "../workspace-avatar";
import { WorkspaceAccent } from "./workspace-accent";

const meta = {
  title: "Layout/Acento por espacio",
  component: WorkspaceAccent,
  args: { color: "#e07a3f" },
} satisfies Meta<typeof WorkspaceAccent>;

export default meta;

type Story = StoryObj<typeof meta>;

// Lo mismo dentro del contenedor de cada espacio: todo lo que usa el acento toma su color. En
// oscuro el color se aclara. La última fila no tiene color y queda el acento por defecto. Las dos
// barras de la derecha son --chart-1 y --chart-2: no cambian con el espacio.
export const PorEspacio: Story = {
  name: "Por espacio",
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    const s = t.shell;
    return (
      <div className="flex flex-col gap-4">
        <p className="max-w-2xl text-sm text-foreground/70">{s.accentNote}</p>
        <ThemePanels labels={t}>
          <div className="flex flex-col gap-3">
            {[
              ...workspaces,
              { id: "none", name: s.defaultAccent, initials: "—", color: null },
            ].map((workspace) => (
              <WorkspaceAccent
                key={workspace.id}
                color={workspace.color}
                className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-card p-3"
              >
                <WorkspaceAvatar initials={workspace.initials} />
                <span className="w-28 text-sm font-medium">
                  {workspace.name}
                </span>
                <ModuleKanji module="DASHBOARD" />
                <Badge variant="accent">
                  {workspace.color ?? s.defaultAccent}
                </Badge>
                <StatusBadge tone="accent" label={t.data.orderStatus.PENDING} />
                <span
                  aria-hidden="true"
                  className="h-2 w-16 rounded-full bg-accent"
                />
                <span aria-hidden="true" className="ml-auto flex gap-1">
                  <span className="h-2 w-6 rounded-full bg-chart-1" />
                  <span className="h-2 w-6 rounded-full bg-chart-2" />
                </span>
              </WorkspaceAccent>
            ))}
          </div>
        </ThemePanels>
      </div>
    );
  },
};

// Un color que no es #rrggbb se ignora (no llega al style) y queda el acento por defecto.
export const ColorInvalido: Story = {
  name: "Color inválido",
  args: { color: "red; background: url(x)" },
  render: (args) => (
    <WorkspaceAccent {...args} className="flex items-center gap-3">
      <WorkspaceAvatar initials="XX" />
      <ModuleKanji module="GENERAL" />
    </WorkspaceAccent>
  ),
};
