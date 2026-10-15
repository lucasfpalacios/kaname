import type { Meta, StoryObj } from "@storybook/react-vite";
import { Plus, SquarePen } from "lucide-react";
import { storyMessages } from "../../stories/messages";
import { ThemePanels } from "../../stories/theme-panels";
import { Badge } from "../badge";
import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  Breadcrumbs,
  BreadcrumbSeparator,
} from "../breadcrumbs";
import { Button } from "../button";
import { WorkspaceAvatar } from "../workspace-avatar";
import { PageHeader } from "./page-header";

const meta = {
  title: "Layout/PageHeader",
  component: PageHeader,
  args: { title: "" },
} satisfies Meta<typeof PageHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Completo: Story = {
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    const s = t.shell;
    return (
      <ThemePanels labels={t}>
        <div className="flex flex-col gap-10">
          <PageHeader
            breadcrumbs={
              <Breadcrumbs label={s.breadcrumbs}>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">{s.home}</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Tank Vault TCG</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumbs>
            }
            leading={<WorkspaceAvatar initials="TV" size="xl" />}
            title="Tank Vault TCG"
            module="DASHBOARD"
            badge={<Badge variant="accent">{s.tankVaultBadge}</Badge>}
            description={s.tankVaultDescription}
            actions={
              <Button variant="secondary">
                <SquarePen />
                {s.editDashboard}
              </Button>
            }
          />
          <PageHeader
            title={t.modules.PRODUCTS}
            module="PRODUCTS"
            actions={
              <Button>
                <Plus />
                {t.actions.newProduct}
              </Button>
            }
          />
          <PageHeader title={s.greeting} />
        </div>
      </ThemePanels>
    );
  },
};
