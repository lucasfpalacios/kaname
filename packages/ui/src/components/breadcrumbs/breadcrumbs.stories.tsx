import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowLeft } from "lucide-react";
import { storyMessages } from "../../stories/messages";
import { forcedStates } from "../../stories/story-row";
import { ThemePanels } from "../../stories/theme-panels";
import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  Breadcrumbs,
  BreadcrumbSeparator,
} from "./breadcrumbs";

const meta = {
  title: "Layout/Breadcrumbs",
  component: Breadcrumbs,
  args: { label: "" },
} satisfies Meta<typeof Breadcrumbs>;

export default meta;

type Story = StoryObj<typeof meta>;

// Inicio / Tank Vault TCG / Productos. "Tank Vault TCG" con hover forzado.
export const Simple: Story = {
  parameters: forcedStates,
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    return (
      <ThemePanels labels={t}>
        <Breadcrumbs label={t.shell.breadcrumbs}>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">
                <ArrowLeft aria-hidden="true" />
                {t.shell.home}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#" className="force-hover">
                Tank Vault TCG
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t.modules.PRODUCTS}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumbs>
      </ThemePanels>
    );
  },
};
