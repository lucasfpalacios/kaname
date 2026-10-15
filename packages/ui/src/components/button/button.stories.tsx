import type { Meta, StoryObj } from "@storybook/react-vite";
import { Plus, Trash2 } from "lucide-react";
import { storyMessages } from "../../stories/messages";
import { forcedStates, StoryRow } from "../../stories/story-row";
import { ThemePanels } from "../../stories/theme-panels";
import { Button } from "./button";

const VARIANTS = ["primary", "secondary", "ghost", "destructive"] as const;
const SIZES = ["sm", "md", "lg"] as const;

const meta = {
  title: "Componentes/Button",
  component: Button,
  args: { variant: "primary", size: "md", loading: false, disabled: false },
  argTypes: {
    variant: { control: "inline-radio", options: VARIANTS },
    size: { control: "inline-radio", options: SIZES },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args, { globals }) => (
    <Button {...args}>{storyMessages(globals.locale).actions.save}</Button>
  ),
};

export const VariantesYEstados: Story = {
  name: "Variantes y estados",
  parameters: forcedStates,
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    return (
      <ThemePanels labels={t}>
        <div className="flex flex-col gap-4">
          {VARIANTS.map((variant) => (
            <StoryRow key={variant} label={variant}>
              <Button variant={variant}>{t.states.default}</Button>
              <Button variant={variant} className="force-hover">
                {t.states.hover}
              </Button>
              <Button variant={variant} className="force-focus">
                {t.states.focus}
              </Button>
              <Button variant={variant} disabled>
                {t.states.disabled}
              </Button>
              <Button variant={variant} loading>
                {t.states.loading}
              </Button>
            </StoryRow>
          ))}
        </div>
      </ThemePanels>
    );
  },
};

export const Tamaños: Story = {
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    return (
      <ThemePanels labels={t}>
        <div className="flex flex-col gap-4">
          {SIZES.map((size) => (
            <StoryRow key={size} label={size}>
              <Button size={size}>{t.actions.save}</Button>
              <Button size={size} variant="secondary">
                <Plus />
                {t.actions.newProduct}
              </Button>
              <Button size={size} loading>
                {t.actions.save}
              </Button>
            </StoryRow>
          ))}
        </div>
      </ThemePanels>
    );
  },
};

export const ConIcono: Story = {
  name: "Con ícono",
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    return (
      <div className="flex flex-wrap gap-3">
        <Button>
          <Plus />
          {t.actions.newProduct}
        </Button>
        <Button variant="destructive">
          <Trash2 />
          {t.actions.delete}
        </Button>
        <Button variant="ghost">{t.actions.cancel}</Button>
      </div>
    );
  },
};

export const ComoLink: Story = {
  name: "Como link (asChild)",
  render: (_args, { globals }) => (
    <Button asChild variant="secondary">
      <a href="#">{storyMessages(globals.locale).actions.viewAll}</a>
    </Button>
  ),
};
