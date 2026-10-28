import type { Meta, StoryObj } from "@storybook/react-vite";
import { LayoutDashboard, Package, Receipt, Tags } from "lucide-react";
import { useState } from "react";
import { storyMessages } from "../../stories/messages";
import { ThemePanels } from "../../stories/theme-panels";
import { WorkspaceAccent } from "../workspace-accent";
import { ModuleSwitch } from "./module-switch";

const meta = {
  title: "Formularios/ModuleSwitch",
  component: ModuleSwitch,
  args: {
    module: "PRODUCTS",
    label: "Productos",
    checked: true,
    onCheckedChange: () => undefined,
  },
} satisfies Meta<typeof ModuleSwitch>;

export default meta;

type Story = StoryObj<typeof meta>;

function List({ locale }: { locale: unknown }) {
  const t = storyMessages(locale);
  const [enabled, setEnabled] = useState({
    PRODUCTS: true,
    PRICE_LISTS: false,
    ORDERS: true,
  });
  return (
    <WorkspaceAccent color="#3d6bd1" className="flex flex-col gap-2">
      {/* El resumen no se puede apagar: deshabilitado y con la explicación. */}
      <ModuleSwitch
        module="DASHBOARD"
        icon={<LayoutDashboard />}
        label={t.modules.DASHBOARD}
        description={t.shell.alwaysOn}
        checked
        disabled
        onCheckedChange={() => undefined}
      />
      {(
        [
          ["PRODUCTS", <Package key="p" />],
          ["PRICE_LISTS", <Tags key="t" />],
          ["ORDERS", <Receipt key="r" />],
        ] as const
      ).map(([module, icon]) => (
        <ModuleSwitch
          key={module}
          module={module}
          icon={icon}
          label={t.modules[module]}
          checked={enabled[module]}
          onCheckedChange={(checked) =>
            setEnabled((current) => ({ ...current, [module]: checked }))
          }
        />
      ))}
    </WorkspaceAccent>
  );
}

// Activos, apagado (kanji atenuado) y el resumen fijo, con el acento de Tank Vault.
export const Lista: Story = {
  render: (_args, { globals }) => (
    <ThemePanels labels={storyMessages(globals.locale)}>
      <List locale={globals.locale} />
    </ThemePanels>
  ),
};
