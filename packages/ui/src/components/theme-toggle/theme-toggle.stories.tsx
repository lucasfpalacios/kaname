import type { Meta, StoryObj } from "@storybook/react-vite";
import { storyMessages } from "../../stories/messages";
import { ThemeProvider } from "../../theme/theme-provider";
import { ThemeToggle } from "./theme-toggle";

const meta = {
  title: "Layout/ThemeToggle",
  component: ThemeToggle,
  args: { label: "", labels: { light: "", dark: "", system: "" } },
} satisfies Meta<typeof ThemeToggle>;

export default meta;

type Story = StoryObj<typeof meta>;

// Con el ThemeProvider real (next-themes): elegir una opción cambia la clase de <html> en esta
// story y le gana al selector de tema de la barra de Storybook.
export const Playground: Story = {
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    return (
      <ThemeProvider>
        <div className="h-48">
          <ThemeToggle
            label={t.shell.theme}
            labels={{ light: t.light, dark: t.dark, system: t.shell.system }}
          />
        </div>
      </ThemeProvider>
    );
  },
};
