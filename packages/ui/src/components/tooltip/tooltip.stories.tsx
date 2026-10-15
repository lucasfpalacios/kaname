import type { Meta, StoryObj } from "@storybook/react-vite";
import { Copy, Pencil } from "lucide-react";
import { storyMessages } from "../../stories/messages";
import { Button } from "../button";
import { IconButton } from "../icon-button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

const meta = {
  title: "Componentes/Tooltip",
  component: Tooltip,
} satisfies Meta<typeof Tooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

// El IconButton ya tiene aria-label: el tooltip lo muestra a quien ve la pantalla.
function Examples({ locale, open }: { locale: unknown; open?: boolean }) {
  const t = storyMessages(locale);
  return (
    <TooltipProvider>
      <div className="flex items-center gap-8 pt-12">
        <Tooltip open={open}>
          <TooltipTrigger asChild>
            <IconButton label={t.tooltip.edit} variant="secondary">
              <Pencil />
            </IconButton>
          </TooltipTrigger>
          <TooltipContent>{t.tooltip.edit}</TooltipContent>
        </Tooltip>
        <Tooltip open={open}>
          <TooltipTrigger asChild>
            <Button variant="ghost">
              <Copy />
              {t.menu.duplicate}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{t.tooltip.duplicate}</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

export const Playground: Story = {
  render: (_args, { globals }) => <Examples locale={globals.locale} />,
};

export const Abierto: Story = {
  render: (_args, { globals }) => <Examples locale={globals.locale} open />,
};

export const AbiertoOscuro: Story = {
  name: "Abierto (oscuro)",
  globals: { theme: "oscuro" },
  render: (_args, { globals }) => <Examples locale={globals.locale} open />,
};
