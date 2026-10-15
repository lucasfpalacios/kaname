import type { Meta, StoryObj } from "@storybook/react-vite";
import { StoryTopBar } from "../../stories/app-frame";
import { storyMessages } from "../../stories/messages";
import { ThemePanels } from "../../stories/theme-panels";
import { AppShell } from "../app-shell";
import { TopBar } from "./top-bar";

const meta = {
  title: "Layout/TopBar",
  component: TopBar,
} satisfies Meta<typeof TopBar>;

export default meta;

type Story = StoryObj<typeof meta>;

// Búsqueda, idioma, tema, notificaciones y usuario, armados por la app. El botón de menú solo
// se ve en mobile.
export const Completa: Story = {
  render: (_args, { globals }) => (
    <ThemePanels labels={storyMessages(globals.locale)}>
      <AppShell sidebar={null} className="min-h-0">
        <StoryTopBar locale={globals.locale} />
      </AppShell>
    </ThemePanels>
  ),
};
