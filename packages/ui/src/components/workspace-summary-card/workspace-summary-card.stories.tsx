import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowRight, ChartNoAxesColumn } from "lucide-react";
import { storyMessages } from "../../stories/messages";
import { ThemePanels } from "../../stories/theme-panels";
import { workspaces } from "../../stories/workspaces";
import { Button } from "../button";
import { EmptyState } from "../empty-state";
import { WorkspaceSummaryCard } from "./workspace-summary-card";

const meta = {
  title: "Layout/WorkspaceSummaryCard",
  component: WorkspaceSummaryCard,
  args: { name: "Tank Vault TCG" },
} satisfies Meta<typeof WorkspaceSummaryCard>;

export default meta;

type Story = StoryObj<typeof meta>;

const MODULES = {
  "tank-vault": ["PRODUCTS", "CUSTOMERS", "PRICE_LISTS", "CALCULATOR"],
  disanza: ["PRODUCTS", "SUPPLIERS", "ORDERS"],
  visio: ["PROJECTS", "CALENDAR"],
  shinka: [],
} as const;

// Las cuatro tarjetas de la vista General, con las métricas todavía vacías (sin datos de ventas
// ni pedidos) y, en Shinka, sin módulos activos: no muestra la lista.
export const Variantes: Story = {
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    const s = t.shell;
    return (
      <ThemePanels labels={t}>
        <div className="grid gap-4 xl:grid-cols-2">
          {workspaces.map((workspace) => (
            <WorkspaceSummaryCard
              key={workspace.id}
              name={workspace.name}
              description={s.types[workspace.type]}
              role={s.owner}
              initials={workspace.initials}
              color={workspace.color}
              modulesLabel={s.activeModules}
              modules={MODULES[workspace.id as keyof typeof MODULES].map(
                (module) => t.modules[module],
              )}
              metrics={
                <EmptyState
                  variant="plain"
                  className="py-6"
                  icon={<ChartNoAxesColumn />}
                  title={s.noData}
                  description={s.noMetricsDescription}
                />
              }
              action={
                <Button asChild variant="ghost" size="sm">
                  <a href="#">
                    {s.openWorkspace}
                    <ArrowRight />
                  </a>
                </Button>
              }
            />
          ))}
        </div>
      </ThemePanels>
    );
  },
};

// Lo mínimo: sin métricas, sin módulos y sin acción.
export const Minima: Story = {
  name: "Mínima",
  args: { name: "Hiru Cerámica", initials: "HC", color: "#c94f7c" },
};
