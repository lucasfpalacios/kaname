import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";
import { storyMessages } from "../../stories/messages";
import { forcedStates, StoryRow } from "../../stories/story-row";
import { ThemePanels } from "../../stories/theme-panels";
import { ThemeProvider } from "../../theme/theme-provider";
import { ThemeToggle, type ThemeToggleProps } from "./theme-toggle";

const meta = {
  title: "Layout/ThemeToggle",
  component: ThemeToggle,
  args: {
    label: "",
    labels: { light: "", dark: "", system: "" },
    cycleLabel: () => "",
  },
} satisfies Meta<typeof ThemeToggle>;

export default meta;

type Story = StoryObj<typeof meta>;

const THEMES = ["light", "dark", "system"] as const;

// Provider de prueba: guarda el tema en su propia clave y lo escribe en un atributo, no en la
// clase de <html>, así no pisa el tema que elige la barra de Storybook.
function StoryThemeProvider({
  theme,
  children,
}: {
  theme: (typeof THEMES)[number];
  children: ReactNode;
}) {
  return (
    <NextThemesProvider
      attribute="data-story-theme"
      storageKey={`kaname-story-theme-${theme}`}
      defaultTheme={theme}
      enableSystem
    >
      {children}
    </NextThemesProvider>
  );
}

function toggleProps(locale: unknown): ThemeToggleProps {
  const t = storyMessages(locale);
  return {
    label: t.shell.theme,
    labels: { light: t.light, dark: t.dark, system: t.shell.system },
    cycleLabel: (current, next) =>
      `${t.shell.theme}: ${current}. ${t.shell.themeNext} ${next}`,
  };
}

// Con el ThemeProvider real del kit: elegir una opción cambia la clase de <html> en esta story y
// le gana al selector de tema de la barra de Storybook.
export const Playground: Story = {
  render: (_args, { globals }) => (
    <ThemeProvider>
      <div className="h-48">
        <ThemeToggle {...toggleProps(globals.locale)} />
      </div>
    </ThemeProvider>
  ),
};

// La píldora sobre el tema elegido (sol, luna, monitor), con foco y hover forzados, en claro y
// oscuro.
export const Estados: Story = {
  parameters: forcedStates,
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    const props = toggleProps(globals.locale);
    return (
      <ThemePanels labels={t}>
        <div className="flex flex-col gap-3">
          {THEMES.map((theme) => (
            <StoryRow key={theme} label={props.labels[theme]}>
              <StoryThemeProvider theme={theme}>
                <ThemeToggle {...props} />
                <ThemeToggle {...props} className="force-hover" />
                <ThemeToggle {...props} className="force-focus-within" />
              </StoryThemeProvider>
            </StoryRow>
          ))}
        </div>
      </ThemePanels>
    );
  },
};

// Pantalla chica (< 640 px): un solo botón con el ícono del tema actual que rota claro → oscuro
// → sistema. El círculo sale del botón.
export const Mobile: Story = {
  globals: { viewport: { value: "mobile1" } },
  render: (_args, { globals }) => (
    <ThemeProvider>
      <div className="flex h-32 justify-end">
        <ThemeToggle {...toggleProps(globals.locale)} />
      </div>
    </ThemeProvider>
  ),
};
