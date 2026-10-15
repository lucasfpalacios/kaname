import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowLeft, SquarePen } from "lucide-react";
import { useMemo } from "react";
import { AppShell } from "../components/app-shell";
import { Badge } from "../components/badge";
import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  Breadcrumbs,
  BreadcrumbSeparator,
} from "../components/breadcrumbs";
import { Button } from "../components/button";
import {
  createDataTableColumnHelper,
  DataTable,
  type DataTableLabels,
} from "../components/data-table";
import { DateText } from "../components/date-text";
import { MoneyText } from "../components/money-text";
import { PageHeader } from "../components/page-header";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "../components/status-badge";
import { WorkspaceAvatar } from "../components/workspace-avatar";
import { fill, StorySidebar, StoryTopBar } from "../stories/app-frame";
import { storyMessages } from "../stories/messages";
import { storyIntlLocale } from "../stories/story-row";
import {
  recentOrders,
  TIME_ZONE,
  type TankVaultOrder,
} from "../stories/tank-vault";
import { SalesChart, TankVaultKpis } from "../stories/tank-vault-widgets";
import { workspaces } from "../stories/workspaces";

const helper = createDataTableColumnHelper<TankVaultOrder>();

function RecentOrders({ locale: storyLocale }: { locale: unknown }) {
  const t = storyMessages(storyLocale);
  const s = t.shell;
  const p = t.table;
  const locale = storyIntlLocale(storyLocale);

  const labels: DataTableLabels<TankVaultOrder> = {
    search: s.ordersSearch,
    selectAll: p.selectAll,
    selectRow: (order) => fill(p.selectRow, { name: order.id }),
    selected: (count) => String(count),
    clearSelection: p.clearSelection,
    clearFilters: p.clearFilters,
    noResults: p.noResults,
    empty: s.ordersEmpty,
    pageInfo: (range) => fill(s.ordersPageInfo, range),
    pageOf: (page) => fill(p.pageOf, page),
    previousPage: p.previousPage,
    nextPage: p.nextPage,
    rowsPerPage: p.rowsPerPage,
  };

  const columns = useMemo(
    () =>
      helper.columns([
        helper.accessor("id", {
          header: s.order,
          cell: ({ row }) => (
            <div className="whitespace-nowrap">
              <p className="font-medium text-primary">{row.original.id}</p>
              <DateText
                value={row.original.createdAt}
                format="datetime"
                locale={locale}
                timeZone={TIME_ZONE}
                className="text-xs text-muted-foreground"
              />
            </div>
          ),
        }),
        helper.accessor("customer", { header: s.customer }),
        helper.accessor("product", { header: t.menu.product }),
        helper.accessor((row) => Number(row.total), {
          id: "total",
          header: s.total,
          enableGlobalFilter: false,
          meta: { numeric: true },
          cell: ({ row }) => (
            <MoneyText
              value={row.original.total}
              currency="ARS"
              locale={locale}
              hideDecimals
              className="font-medium"
            />
          ),
        }),
        helper.accessor("status", {
          header: s.status,
          enableGlobalFilter: false,
          cell: ({ row }) => (
            <div className="flex flex-wrap gap-1.5">
              <OrderStatusBadge
                status={row.original.status}
                label={t.data.orderStatus[row.original.status]}
              />
              <PaymentStatusBadge
                status={row.original.payment}
                label={t.data.paymentStatus[row.original.payment]}
              />
            </div>
          ),
        }),
      ]),
    [locale, s, t],
  );

  return (
    <section aria-labelledby="recent-orders" className="flex flex-col gap-3">
      <h2 id="recent-orders" className="font-display text-xl font-semibold">
        {s.recentOrders}
      </h2>
      <DataTable
        columns={columns}
        data={recentOrders}
        labels={labels}
        getRowId={(order) => order.id}
        pageSize={5}
      />
    </section>
  );
}

// Resumen de Tank Vault como tank_vault_light/dark de Stitch.
function TankVault({
  locale: storyLocale,
  collapsed,
}: {
  locale: unknown;
  collapsed?: boolean;
}) {
  const t = storyMessages(storyLocale);
  const s = t.shell;
  const workspace = workspaces.find((w) => w.id === "tank-vault")!;
  return (
    <AppShell
      accentColor={workspace.color}
      defaultCollapsed={collapsed}
      skipToContentLabel={s.skip}
      sidebar={
        <StorySidebar
          locale={storyLocale}
          workspaceId={workspace.id}
          active="DASHBOARD"
        />
      }
      topBar={<StoryTopBar locale={storyLocale} />}
    >
      <PageHeader
        breadcrumbs={
          <Breadcrumbs label={s.breadcrumbs}>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">
                  <ArrowLeft aria-hidden="true" />
                  {s.home}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{workspace.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumbs>
        }
        leading={
          <WorkspaceAvatar
            initials={workspace.initials}
            color={workspace.color}
            size="xl"
          />
        }
        title={workspace.name}
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
      <TankVaultKpis locale={storyLocale} className="xl:grid-cols-4" />
      <SalesChart locale={storyLocale} />
      <RecentOrders locale={storyLocale} />
    </AppShell>
  );
}

const meta = {
  title: "Pantallas/Tank Vault",
  component: TankVault,
  parameters: { layout: "fullscreen" },
  args: { locale: "es" },
} satisfies Meta<typeof TankVault>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Claro: Story = {
  render: (_args, { globals }) => <TankVault locale={globals.locale} />,
};

export const Oscuro: Story = {
  globals: { theme: "oscuro" },
  render: (_args, { globals }) => <TankVault locale={globals.locale} />,
};

// Sidebar colapsado (ícono + kanji). Pasá el mouse o navegá con Tab: se expande sobre el contenido.
export const SidebarColapsado: Story = {
  name: "Sidebar colapsado",
  render: (_args, { globals }) => (
    <TankVault locale={globals.locale} collapsed />
  ),
};
