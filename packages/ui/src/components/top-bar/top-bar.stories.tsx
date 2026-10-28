import type { Meta, StoryObj } from "@storybook/react-vite";
import { StoryTopBar } from "../../stories/app-frame";
import { storyMessages } from "../../stories/messages";
import { ThemePanels } from "../../stories/theme-panels";
import { AppShell } from "../app-shell";
import { TopBar, TopBarActions, TopBarSearch } from "./top-bar";

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

// La búsqueda mientras no está disponible: deshabilitada, con el mismo lugar en la barra. En
// pantallas chicas no se muestra.
export const BusquedaDeshabilitada: Story = {
  name: "Búsqueda deshabilitada",
  render: (_args, { globals }) => {
    const s = storyMessages(globals.locale).shell;
    return (
      <ThemePanels labels={storyMessages(globals.locale)}>
        <AppShell sidebar={null} className="min-h-0">
          <TopBar>
            <TopBarSearch label={s.search} placeholder={s.search} disabled />
            <TopBarActions />
          </TopBar>
        </AppShell>
      </ThemePanels>
    );
  },
};
