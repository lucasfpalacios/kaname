import type { Meta, StoryObj } from "@storybook/react-vite";
import { storyMessages } from "../../stories/messages";
import { ThemePanels } from "../../stories/theme-panels";
import { MODULE_KANJI, ModuleKanji, type ModuleKanjiKey } from "./module-kanji";

const MODULES = Object.keys(MODULE_KANJI) as ModuleKanjiKey[];

const meta = {
  title: "Componentes/ModuleKanji",
  component: ModuleKanji,
  args: { module: "PRODUCTS", size: "md" },
  argTypes: {
    module: { control: "select", options: MODULES },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
} satisfies Meta<typeof ModuleKanji>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Tamaños: Story = {
  render: (args, { globals }) => {
    const t = storyMessages(globals.locale);
    return (
      <ThemePanels labels={t}>
        <div className="flex items-end gap-6">
          {(["sm", "md", "lg"] as const).map((size) => (
            <div key={size} className="flex flex-col items-center gap-2">
              <ModuleKanji module={args.module} size={size} />
              <span className="font-mono text-xs opacity-70">{size}</span>
            </div>
          ))}
        </div>
      </ThemePanels>
    );
  },
};

export const JuntoAlTitulo: Story = {
  name: "Junto al título",
  render: (args, { globals }) => {
    const t = storyMessages(globals.locale);
    return (
      <ThemePanels labels={t}>
        <h1 className="flex items-baseline gap-3 font-display text-3xl font-extrabold">
          {t.modules[args.module]}
          <ModuleKanji module={args.module} size="md" />
        </h1>
      </ThemePanels>
    );
  },
};

export const Todos: Story = {
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    return (
      <ThemePanels labels={t}>
        <ul className="grid gap-3 sm:grid-cols-2">
          {MODULES.map((module) => (
            <li
              key={module}
              className="flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3"
            >
              <ModuleKanji module={module} size="md" className="w-18" />
              <span className="text-sm">{t.modules[module]}</span>
            </li>
          ))}
        </ul>
      </ThemePanels>
    );
  },
};
