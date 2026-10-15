import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Archive,
  Copy,
  Download,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { storyMessages } from "../../stories/messages";
import { IconButton } from "../icon-button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./dropdown-menu";

const meta = {
  title: "Componentes/DropdownMenu",
  component: DropdownMenu,
} satisfies Meta<typeof DropdownMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

function ProductMenu({
  locale,
  defaultOpen,
}: {
  locale: unknown;
  defaultOpen?: boolean;
}) {
  const t = storyMessages(locale);
  return (
    <div className="h-96">
      <DropdownMenu defaultOpen={defaultOpen} modal={!defaultOpen}>
        <DropdownMenuTrigger asChild>
          <IconButton label={t.menu.open} variant="secondary">
            <MoreHorizontal />
          </IconButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>{t.menu.product}</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Pencil />
              {t.actions.edit}
              <DropdownMenuShortcut>E</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Copy />
              {t.menu.duplicate}
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <Archive />
              {t.menu.archive}
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Download />
                {t.menu.export}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>CSV</DropdownMenuItem>
                <DropdownMenuItem>PDF</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>{t.menu.columns}</DropdownMenuLabel>
          <DropdownMenuCheckboxItem checked>
            {t.menu.showSku}
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem>{t.menu.showCost}</DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>{t.menu.sortBy}</DropdownMenuLabel>
          <DropdownMenuRadioGroup value="name">
            <DropdownMenuRadioItem value="name">
              {t.menu.sortName}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="price">
              {t.menu.sortPrice}
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            <Trash2 />
            {t.actions.delete}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export const Playground: Story = {
  render: (_args, { globals }) => <ProductMenu locale={globals.locale} />,
};

export const Abierto: Story = {
  render: (_args, { globals }) => (
    <ProductMenu locale={globals.locale} defaultOpen />
  ),
};

export const AbiertoOscuro: Story = {
  name: "Abierto (oscuro)",
  globals: { theme: "oscuro" },
  render: (_args, { globals }) => (
    <ProductMenu locale={globals.locale} defaultOpen />
  ),
};
