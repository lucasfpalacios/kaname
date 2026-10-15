import type { Meta, StoryObj } from "@storybook/react-vite";
import { storyMessages } from "../../stories/messages";
import { Button } from "../button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

const meta = {
  title: "Componentes/Popover",
  component: Popover,
} satisfies Meta<typeof Popover>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="secondary">{t.card.title}</Button>
        </PopoverTrigger>
        <PopoverContent>
          <p className="font-medium">{t.card.title}</p>
          <p className="text-sm text-foreground/70">{t.card.body}</p>
        </PopoverContent>
      </Popover>
    );
  },
};

export const Abierto: Story = {
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    return (
      <div className="h-40">
        <Popover defaultOpen>
          <PopoverTrigger asChild>
            <Button variant="secondary">{t.card.title}</Button>
          </PopoverTrigger>
          <PopoverContent align="start">
            <p className="font-medium">{t.card.title}</p>
            <p className="text-sm text-foreground/70">{t.card.body}</p>
          </PopoverContent>
        </Popover>
      </div>
    );
  },
};
