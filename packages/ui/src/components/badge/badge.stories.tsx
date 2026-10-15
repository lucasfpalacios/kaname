import type { Meta, StoryObj } from "@storybook/react-vite";
import { CircleAlert, CircleCheck, Clock } from "lucide-react";
import { storyMessages } from "../../stories/messages";
import { StoryRow } from "../../stories/story-row";
import { ThemePanels } from "../../stories/theme-panels";
import { Badge } from "./badge";

const VARIANTS = [
  "primary",
  "secondary",
  "accent",
  "info",
  "success",
  "warning",
  "destructive",
] as const;

const meta = {
  title: "Componentes/Badge",
  component: Badge,
  args: { variant: "primary" },
  argTypes: { variant: { control: "inline-radio", options: VARIANTS } },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args, { globals }) => (
    <Badge {...args}>{storyMessages(globals.locale).badges.new}</Badge>
  ),
};

export const Variantes: Story = {
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    const examples = {
      primary: t.badges.new,
      secondary: t.badges.draft,
      accent: t.badges.active,
      info: t.badges.shipped,
      success: t.badges.paid,
      warning: t.badges.pending,
      destructive: t.badges.outOfStock,
    };
    return (
      <ThemePanels labels={t}>
        <div className="flex flex-col gap-3">
          {VARIANTS.map((variant) => (
            <StoryRow key={variant} label={variant}>
              <Badge variant={variant}>{examples[variant]}</Badge>
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
      <ThemePanels labels={t}>
        <div className="flex flex-wrap gap-2">
          <Badge variant="success">
            <CircleCheck aria-hidden="true" />
            {t.badges.paid}
          </Badge>
          <Badge variant="warning">
            <Clock aria-hidden="true" />
            {t.badges.pending}
          </Badge>
          <Badge variant="destructive">
            <CircleAlert aria-hidden="true" />
            {t.badges.outOfStock}
          </Badge>
        </div>
      </ThemePanels>
    );
  },
};
