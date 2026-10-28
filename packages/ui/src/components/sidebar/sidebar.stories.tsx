import type { Meta, StoryObj } from "@storybook/react-vite";
import { StorySidebar, StoryTopBar } from "../../stories/app-frame";
import { TankVaultKpis } from "../../stories/tank-vault-widgets";
import { AppShell } from "../app-shell";
import { PageHeader } from "../page-header";
import { Sidebar } from "./sidebar";

const meta = {
  title: "Layout/Sidebar",
  component: Sidebar,
  parameters: { layout: "fullscreen" },
  args: { label: "", closeLabel: "" },
} satisfies Meta<typeof Sidebar>;

export default meta;

type Story = StoryObj<typeof meta>;

// El sidebar vive dentro de AppShell (de ahí sale el estado colapsado). Con contenido al lado,
// para ver que al expandirse por hover se superpone sin moverlo.
function Frame({
  locale,
  collapsed,
}: {
  locale: unknown;
  collapsed?: boolean;
}) {
  return (
    <AppShell
      defaultCollapsed={collapsed}
      sidebar={
        <StorySidebar
          locale={locale}
          workspaceId="tank-vault"
          active="PRODUCTS"
        />
      }
      topBar={<StoryTopBar locale={locale} />}
    >
      <PageHeader title="Tank Vault TCG" module="PRODUCTS" />
      <TankVaultKpis locale={locale} className="xl:grid-cols-4" />
    </AppShell>
  );
}

// Fijado expandido: ícono + kanji + nombre, en el layout.
export const Expandido: Story = {
  render: (_args, { globals }) => <Frame locale={globals.locale} />,
};

// Colapsado (100 px): ícono + kanji. Pasá el mouse (se abre a los 150 ms) o entrá con Tab: se
// expande superpuesto al contenido, sin moverlo, y agrega el nombre a la derecha. Ícono y kanji
// no cambian de lugar. El nombre siempre está para lectores de pantalla.
export const Colapsado: Story = {
  render: (_args, { globals }) => <Frame locale={globals.locale} collapsed />,
};

export const ColapsadoOscuro: Story = {
  name: "Colapsado (oscuro)",
  globals: { theme: "oscuro" },
  render: (_args, { globals }) => <Frame locale={globals.locale} collapsed />,
};
