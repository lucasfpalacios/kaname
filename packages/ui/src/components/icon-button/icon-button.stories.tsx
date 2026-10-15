import type { Meta, StoryObj } from "@storybook/react-vite";
import { Ellipsis, Pencil, Trash2, X } from "lucide-react";
import { storyMessages } from "../../stories/messages";
import { forcedStates, StoryRow } from "../../stories/story-row";
import { ThemePanels } from "../../stories/theme-panels";
import { IconButton } from "./icon-button";

const VARIANTS = ["primary", "secondary", "ghost", "destructive"] as const;
const SIZES = ["sm", "md", "lg"] as const;

const meta = {
  title: "Componentes/IconButton",
  component: IconButton,
  args: {
    label: "Editar",
    variant: "ghost",
    size: "md",
    loading: false,
    disabled: false,
  },
  argTypes: {
    variant: { control: "inline-radio", options: VARIANTS },
    size: { control: "inline-radio", options: SIZES },
  },
} satisfies Meta<typeof IconButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args, { globals }) => (
    <IconButton {...args} label={storyMessages(globals.locale).actions.edit}>
      <Pencil />
    </IconButton>
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
          {VARIANTS.map((variant) => {
            const Icon = variant === "destructive" ? Trash2 : Pencil;
            const label =
              variant === "destructive" ? t.actions.delete : t.actions.edit;
            return (
              <StoryRow key={variant} label={variant}>
                <IconButton variant={variant} label={label}>
                  <Icon />
                </IconButton>
                <IconButton
                  variant={variant}
                  label={label}
                  className="force-hover"
                >
                  <Icon />
                </IconButton>
                <IconButton
                  variant={variant}
                  label={label}
                  className="force-focus"
                >
                  <Icon />
                </IconButton>
                <IconButton variant={variant} label={label} disabled>
                  <Icon />
                </IconButton>
                <IconButton variant={variant} label={label} loading>
                  <Icon />
                </IconButton>
              </StoryRow>
            );
          })}
          <p className="text-xs opacity-70">
            {[
              t.states.default,
              t.states.hover,
              t.states.focus,
              t.states.disabled,
              t.states.loading,
            ].join(" · ")}
          </p>
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
              <IconButton size={size} label={t.actions.more}>
                <Ellipsis />
              </IconButton>
              <IconButton
                size={size}
                variant="secondary"
                label={t.actions.close}
              >
                <X />
              </IconButton>
              <IconButton size={size} variant="primary" label={t.actions.edit}>
                <Pencil />
              </IconButton>
            </StoryRow>
          ))}
        </div>
      </ThemePanels>
    );
  },
};
