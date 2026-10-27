import type { Meta, StoryObj } from "@storybook/react-vite";
import { LogOut, User } from "lucide-react";
import { storyMessages } from "../../stories/messages";
import { ThemePanels } from "../../stories/theme-panels";
import { DropdownMenuItem, DropdownMenuSeparator } from "../dropdown-menu";
import { UserMenu } from "./user-menu";

const meta = {
  title: "Layout/UserMenu",
  component: UserMenu,
  args: { name: "", label: "", children: null },
} satisfies Meta<typeof UserMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

function Example({ locale, open }: { locale: unknown; open?: boolean }) {
  const t = storyMessages(locale);
  return (
    <UserMenu
      name="Lucas Facundo Palacios"
      subtitle={t.shell.userRole}
      email="lucasfpalacios@gmail.com"
      label={t.auth.userMenu}
      defaultOpen={open}
    >
      <DropdownMenuItem>
        <User />
        {t.auth.profile}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem>
        <LogOut />
        {t.auth.signOut}
      </DropdownMenuItem>
    </UserMenu>
  );
}

// Cerrado, en claro y oscuro. En mobile se ve solo el avatar.
export const Cerrado: Story = {
  render: (_args, { globals }) => (
    <ThemePanels labels={storyMessages(globals.locale)}>
      <div className="flex justify-end">
        <Example locale={globals.locale} />
      </div>
    </ThemePanels>
  ),
};

export const Abierto: Story = {
  render: (_args, { globals }) => (
    <div className="flex h-56 justify-end">
      <Example locale={globals.locale} open />
    </div>
  ),
};

export const AbiertoOscuro: Story = {
  name: "Abierto (oscuro)",
  globals: { theme: "oscuro" },
  render: (_args, { globals }) => (
    <div className="flex h-56 justify-end">
      <Example locale={globals.locale} open />
    </div>
  ),
};
