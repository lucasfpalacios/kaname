import type { Meta, StoryObj } from "@storybook/react-vite";
import { StorySidebar, StoryTopBar } from "../../stories/app-frame";
import { storyMessages } from "../../stories/messages";
import { workspaces } from "../../stories/workspaces";
import { EmptyState } from "../empty-state";
import { PageHeader } from "../page-header";
import { AppShell } from "./app-shell";

const meta = {
  title: "Layout/AppShell",
  component: AppShell,
  parameters: { layout: "fullscreen" },
  args: { sidebar: null },
} satisfies Meta<typeof AppShell>;

export default meta;

type Story = StoryObj<typeof meta>;

// Estructura vacía con el acento de Disanza (naranja): la línea activa del sidebar, el kanji y
// el borde del EmptyState toman el color del espacio. Con Tab aparece "Saltar al contenido".
export const ConAcento: Story = {
  name: "Con acento del espacio",
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    const disanza = workspaces.find((w) => w.id === "disanza")!;
    return (
      <AppShell
        accentColor={disanza.color}
        skipToContentLabel={t.shell.skip}
        sidebar={
          <StorySidebar
            locale={globals.locale}
            workspaceId={disanza.id}
            active="PRODUCTS"
          />
        }
        topBar={<StoryTopBar locale={globals.locale} />}
      >
        <PageHeader title={t.modules.PRODUCTS} module="PRODUCTS" />
        <EmptyState
          title={t.table.empty}
          description={t.table.emptyDescription}
        />
      </AppShell>
    );
  },
};

// Mobile: el sidebar se abre como drawer desde el botón de menú de la TopBar.
export const Mobile: Story = {
  globals: { viewport: { value: "mobile1" } },
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    return (
      <AppShell
        sidebar={
          <StorySidebar
            locale={globals.locale}
            workspaceId="tank-vault"
            active="DASHBOARD"
          />
        }
        topBar={<StoryTopBar locale={globals.locale} />}
      >
        <PageHeader title="Tank Vault TCG" module="DASHBOARD" />
        <EmptyState title={t.table.empty} />
      </AppShell>
    );
  },
};
