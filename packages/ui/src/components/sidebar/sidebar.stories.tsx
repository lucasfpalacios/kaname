import type { Meta, StoryObj } from "@storybook/react-vite";
import { StorySidebar } from "../../stories/app-frame";
import { AppShell } from "../app-shell";
import { Sidebar } from "./sidebar";

const meta = {
  title: "Layout/Sidebar",
  component: Sidebar,
  parameters: { layout: "fullscreen" },
  args: { label: "" },
} satisfies Meta<typeof Sidebar>;

export default meta;

type Story = StoryObj<typeof meta>;

// El sidebar vive dentro de AppShell (de ahí sale el estado colapsado).
export const Expandido: Story = {
  render: (_args, { globals }) => (
    <AppShell
      sidebar={
        <StorySidebar
          locale={globals.locale}
          workspaceId="tank-vault"
          active="PRODUCTS"
        />
      }
    />
  ),
};

// Colapsado: una columna de kanji; el nombre aparece en un tooltip y lo leen los lectores.
export const Colapsado: Story = {
  render: (_args, { globals }) => (
    <AppShell
      defaultCollapsed
      sidebar={
        <StorySidebar
          locale={globals.locale}
          workspaceId="tank-vault"
          active="PRODUCTS"
        />
      }
    />
  ),
};

export const ColapsadoOscuro: Story = {
  name: "Colapsado (oscuro)",
  globals: { theme: "oscuro" },
  render: (_args, { globals }) => (
    <AppShell
      defaultCollapsed
      sidebar={
        <StorySidebar
          locale={globals.locale}
          workspaceId="tank-vault"
          active="PRODUCTS"
        />
      }
    />
  ),
};
