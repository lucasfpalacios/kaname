"use client";

import {
  AppShell,
  Badge,
  Button,
  ChartCard,
  Checkbox,
  createDataTableColumnHelper,
  DataTable,
  DatePicker,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  EmptyState,
  FormField,
  IconButton,
  Input,
  KpiCard,
  Label,
  MoneyInput,
  MoneyText,
  OrderStatusBadge,
  PageHeader,
  PaymentStatusBadge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Sidebar,
  SidebarCollapseButton,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarItem,
  SidebarMobileTrigger,
  StatusBadge,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  toast,
  Toaster,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TopBar,
  TopBarActions,
  WorkspaceSwitcher,
  WorkspaceTile,
  type DataTableLabels,
  type MoneyCurrency,
  type WorkspaceSwitcherItem,
} from "@kaname/ui";
import {
  Banknote,
  ClipboardList,
  Copy,
  Database,
  Layers,
  LayoutGrid,
  MoreHorizontal,
  MousePointerClick,
  Pencil,
  PieChart,
  Plus,
  ShoppingBag,
  SquareStack,
  TextCursorInput,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { type ReactNode, useMemo, useState } from "react";
import { LocaleSwitcher } from "../locale-switcher";
import { ThemeToggle } from "../theme-toggle";

// Datos de ejemplo (nombres propios y SKUs, no textos de interfaz).
type Product = {
  id: string;
  name: string;
  sku: string;
  stock: number;
  reorderPoint: number;
  price: string;
};

const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Booster Box Surging Sparks",
    sku: "PKM-SV8-BB-EN",
    stock: 2,
    reorderPoint: 10,
    price: "345000",
  },
  {
    id: "p2",
    name: "Elite Trainer Box Pokémon 151",
    sku: "PKM-151-ETB-EN",
    stock: 3,
    reorderPoint: 8,
    price: "118000",
  },
  {
    id: "p3",
    name: "Pack 6x Prismatic Evolutions",
    sku: "PKM-PRE-6BP",
    stock: 24,
    reorderPoint: 10,
    price: "85000",
  },
  {
    id: "p4",
    name: "Booster Box Twilight Masquerade",
    sku: "PKM-TWM-BB-EN",
    stock: 8,
    reorderPoint: 6,
    price: "240000",
  },
  {
    id: "p5",
    name: "Dragon Shield Matte Dual (100)",
    sku: "ACC-DS-DUAL-BK",
    stock: 5,
    reorderPoint: 15,
    price: "24000",
  },
  {
    id: "p6",
    name: "Paldean Fates 3-Blister Pack",
    sku: "PKM-PAF-3BL",
    stock: 18,
    reorderPoint: 6,
    price: "92500",
  },
  {
    id: "p7",
    name: "Umbreon VMAX Alt Art",
    sku: "SNG-EVS-215-NM",
    stock: 1,
    reorderPoint: 0,
    price: "1150000",
  },
];

const SALES = [
  [2108000, 992000],
  [2346000, 1104000],
  [2652000, 1248000],
  [2822000, 1328000],
  [2924000, 1376000],
  [3141600, 1478400],
];

const WORKSPACES = [
  { id: "general", initials: undefined, color: null, type: undefined },
  {
    id: "tank-vault",
    name: "Tank Vault TCG",
    initials: "TV",
    color: "#3d6bd1",
    type: "business",
  },
  {
    id: "disanza",
    name: "Disanza",
    initials: "DZ",
    color: "#e07a3f",
    type: "business",
  },
  {
    id: "shinka",
    name: "Shinka",
    initials: "SK",
    color: "#c94f7c",
    type: "projects",
  },
] as const;

const SECTIONS = [
  { id: "actions", icon: <MousePointerClick /> },
  { id: "forms", icon: <TextCursorInput /> },
  { id: "overlays", icon: <SquareStack /> },
  { id: "data", icon: <Database /> },
  { id: "spaces", icon: <LayoutGrid /> },
] as const;

const helper = createDataTableColumnHelper<Product>();

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="flex scroll-mt-20 flex-col gap-4"
    >
      <h2 id={`${id}-title`} className="font-display text-xl font-semibold">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function UiKitShowcase({ intlLocale }: { intlLocale: string }) {
  const t = useTranslations("UiKit");
  const [workspaceId, setWorkspaceId] = useState<string>("tank-vault");
  const [currency, setCurrency] = useState<MoneyCurrency>("ARS");
  const [price, setPrice] = useState<string | null>("345000");
  const [release, setRelease] = useState<Date | undefined>(undefined);

  const workspaceItems: WorkspaceSwitcherItem[] = WORKSPACES.map((workspace) =>
    workspace.id === "general"
      ? {
          id: workspace.id,
          name: t("spaces.general"),
          description: t("spaces.generalDescription"),
          icon: <LayoutGrid />,
        }
      : {
          id: workspace.id,
          name: workspace.name,
          description: t(`spaces.${workspace.type}`),
          initials: workspace.initials,
          color: workspace.color,
        },
  );
  const accentColor =
    WORKSPACES.find((workspace) => workspace.id === workspaceId)?.color ?? null;

  const months = useMemo(() => {
    const format = new Intl.DateTimeFormat(intlLocale, {
      month: "short",
      timeZone: "UTC",
    });
    return SALES.map((_, index) =>
      format.format(new Date(Date.UTC(2026, 4 + index, 1))),
    );
  }, [intlLocale]);

  const tableLabels: DataTableLabels<Product> = {
    search: t("table.search"),
    selectAll: t("table.selectAll"),
    selectRow: (product) => t("table.selectRow", { name: product.name }),
    selected: (count) => t("table.selected", { count }),
    clearSelection: t("table.clearSelection"),
    clearFilters: t("table.clearFilters"),
    noResults: t("table.noResults"),
    noResultsDescription: t("table.noResultsDescription"),
    empty: t("table.empty"),
    pageInfo: (range) => t("table.pageInfo", range),
    pageOf: (page) => t("table.pageOf", page),
    previousPage: t("table.previousPage"),
    nextPage: t("table.nextPage"),
    rowsPerPage: t("table.rowsPerPage"),
  };

  const columns = useMemo(
    () =>
      helper.columns([
        helper.accessor((row) => `${row.name} ${row.sku}`, {
          id: "product",
          header: t("data.product"),
          cell: ({ row }) => (
            <div>
              <p className="font-medium">{row.original.name}</p>
              <p className="text-xs text-muted-foreground">
                {row.original.sku}
              </p>
            </div>
          ),
        }),
        helper.accessor("stock", {
          header: t("data.stock"),
          enableGlobalFilter: false,
          meta: { numeric: true },
          cell: ({ row }) =>
            row.original.stock <= row.original.reorderPoint ? (
              <StatusBadge
                tone="warning"
                label={t("data.lowStock", { count: row.original.stock })}
              />
            ) : (
              t("data.units", { count: row.original.stock })
            ),
        }),
        helper.accessor((row) => Number(row.price), {
          id: "price",
          header: t("data.price"),
          enableGlobalFilter: false,
          meta: { numeric: true },
          cell: ({ row }) => (
            <MoneyText
              value={row.original.price}
              currency="ARS"
              locale={intlLocale}
              hideDecimals
            />
          ),
        }),
      ]),
    [intlLocale, t],
  );

  return (
    <AppShell
      accentColor={accentColor}
      skipToContentLabel={t("skip")}
      sidebar={
        <Sidebar label={t("nav")}>
          <SidebarHeader>
            <WorkspaceSwitcher
              workspaces={workspaceItems}
              currentId={workspaceId}
              label={t("switchWorkspace")}
              groupLabel={t("workspaces")}
              onSelect={setWorkspaceId}
            />
          </SidebarHeader>
          <SidebarContent>
            {/* Sin título: el nav ya se llama "Secciones". */}
            <SidebarGroup>
              {SECTIONS.map((section) => (
                <SidebarItem
                  key={section.id}
                  href={`#${section.id}`}
                  icon={section.icon}
                  label={t(`sections.${section.id}`)}
                />
              ))}
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarCollapseButton
              collapseLabel={t("collapse")}
              expandLabel={t("expand")}
            />
          </SidebarFooter>
        </Sidebar>
      }
      topBar={
        <TopBar>
          <SidebarMobileTrigger label={t("openMenu")} />
          <TopBarActions>
            <LocaleSwitcher />
            <ThemeToggle />
          </TopBarActions>
        </TopBar>
      }
    >
      <PageHeader
        title={t("title")}
        description={t("description")}
        badge={<Badge variant="accent">{t("devOnly")}</Badge>}
      />

      <Section id="actions" title={t("sections.actions")}>
        <div className="flex flex-wrap items-center gap-3">
          <Button>{t("buttons.save")}</Button>
          <Button variant="secondary">{t("buttons.cancel")}</Button>
          <Button variant="ghost">{t("buttons.viewAll")}</Button>
          <Button variant="destructive">
            <Trash2 />
            {t("buttons.delete")}
          </Button>
          <Button loading>{t("buttons.save")}</Button>
          <IconButton label={t("buttons.more")} variant="secondary">
            <MoreHorizontal />
          </IconButton>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{t("badges.new")}</Badge>
          <Badge variant="secondary">{t("badges.draft")}</Badge>
          <Badge variant="warning">{t("badges.low")}</Badge>
          <OrderStatusBadge status="PENDING" label={t("orderStatus.PENDING")} />
          <OrderStatusBadge
            status="PREPARING"
            label={t("orderStatus.PREPARING")}
          />
          <OrderStatusBadge status="SHIPPED" label={t("orderStatus.SHIPPED")} />
          <OrderStatusBadge
            status="DELIVERED"
            label={t("orderStatus.DELIVERED")}
          />
          <OrderStatusBadge
            status="CANCELLED"
            label={t("orderStatus.CANCELLED")}
          />
          <PaymentStatusBadge
            status="UNPAID"
            label={t("paymentStatus.UNPAID")}
          />
          <PaymentStatusBadge status="PAID" label={t("paymentStatus.PAID")} />
        </div>
      </Section>

      <Section id="forms" title={t("sections.forms")}>
        <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
          <FormField
            label={t("form.name")}
            description={t("form.nameHelp")}
            required
          >
            <Input placeholder={t("form.namePlaceholder")} />
          </FormField>
          <FormField label={t("form.category")}>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder={t("form.categoryPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {(["boosterBox", "singles", "accessories"] as const).map(
                  (key) => (
                    <SelectItem key={key} value={key}>
                      {t(`form.categories.${key}`)}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label={t("form.price")}>
            <MoneyInput
              value={price}
              onValueChange={setPrice}
              currency={currency}
              onCurrencyChange={setCurrency}
              currencyLabel={t("form.currency")}
              locale={intlLocale}
            />
          </FormField>
          <FormField label={t("form.release")}>
            <DatePicker
              value={release}
              onValueChange={setRelease}
              placeholder={t("form.releasePlaceholder")}
              locale={intlLocale}
            />
          </FormField>
          <div className="flex items-center gap-2">
            <Switch id="track-stock" defaultChecked />
            <Label htmlFor="track-stock">{t("form.trackStock")}</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="published" />
            <Label htmlFor="published">{t("form.published")}</Label>
          </div>
        </div>
      </Section>

      <Section id="overlays" title={t("sections.overlays")}>
        <div className="flex flex-wrap items-center gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">{t("overlays.openDialog")}</Button>
            </DialogTrigger>
            <DialogContent closeLabel={t("overlays.close")}>
              <DialogHeader>
                <DialogTitle>{t("overlays.dialogTitle")}</DialogTitle>
                <DialogDescription>
                  {t("overlays.dialogBody")}
                </DialogDescription>
              </DialogHeader>
              <FormField label={t("form.name")}>
                <Input defaultValue={t("overlays.sheetTitle")} />
              </FormField>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="ghost">{t("buttons.cancel")}</Button>
                </DialogClose>
                <Button>{t("buttons.save")}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary">{t("overlays.openSheet")}</Button>
            </SheetTrigger>
            <SheetContent closeLabel={t("overlays.close")}>
              <SheetHeader>
                <SheetTitle>{t("overlays.sheetTitle")}</SheetTitle>
                <SheetDescription>{t("overlays.sheetBody")}</SheetDescription>
              </SheetHeader>
              <SheetBody>
                <EmptyState variant="plain" title={t("data.emptyTitle")} />
              </SheetBody>
            </SheetContent>
          </Sheet>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary">{t("overlays.menu")}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Pencil />
                {t("overlays.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy />
                {t("overlays.duplicate")}
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive">
                <Trash2 />
                {t("buttons.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <IconButton label={t("overlays.duplicate")} variant="secondary">
                <Copy />
              </IconButton>
            </TooltipTrigger>
            <TooltipContent>{t("overlays.tooltip")}</TooltipContent>
          </Tooltip>
          <Button
            variant="secondary"
            onClick={() =>
              toast({
                variant: "success",
                title: t("overlays.toastTitle"),
                description: t("overlays.toastBody"),
              })
            }
          >
            {t("overlays.showToast")}
          </Button>
        </div>
        <Tabs defaultValue="general" className="max-w-xl">
          <TabsList variant="line">
            <TabsTrigger value="general">{t("tabs.general")}</TabsTrigger>
            <TabsTrigger value="variants">
              <Layers />
              {t("tabs.variants")}
            </TabsTrigger>
            <TabsTrigger value="history">{t("tabs.history")}</TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="text-sm">
            {t("tabs.generalBody")}
          </TabsContent>
          <TabsContent value="variants" className="text-sm">
            {t("tabs.variantsBody")}
          </TabsContent>
          <TabsContent value="history" className="text-sm">
            {t("tabs.historyBody")}
          </TabsContent>
        </Tabs>
      </Section>

      <Section id="data" title={t("sections.data")}>
        <div className="grid gap-4 sm:grid-cols-3">
          <KpiCard
            label={t("data.sales")}
            icon={<Banknote />}
            value={
              <MoneyText
                value="4620000"
                currency="ARS"
                locale={intlLocale}
                hideDecimals
              />
            }
            change={{ value: "14.2", label: t("data.vsLastMonth") }}
            locale={intlLocale}
          />
          <KpiCard
            label={t("data.margin")}
            icon={<PieChart />}
            value={new Intl.NumberFormat(intlLocale, {
              style: "percent",
              maximumFractionDigits: 1,
            }).format(0.385)}
            change={{ value: "-2.1", label: t("data.vsLastMonth") }}
            locale={intlLocale}
          />
          <KpiCard
            label={t("data.pending")}
            icon={<ClipboardList />}
            value={t("data.pendingValue", { count: 8 })}
            description={t("data.pendingDetail", { count: 5 })}
            locale={intlLocale}
          />
        </div>
        <ChartCard
          title={t("data.chartTitle")}
          description={t("data.chartDescription")}
          data={SALES.map(([national, local], index) => ({
            month: months[index],
            national,
            local,
          }))}
          xKey="month"
          series={[
            { key: "national", label: t("data.national") },
            { key: "local", label: t("data.local") },
          ]}
          stacked
          format={{ style: "money", currency: "ARS" }}
          locale={intlLocale}
          emptyText={t("data.chartEmpty")}
        />
        <DataTable
          columns={columns}
          data={PRODUCTS}
          labels={tableLabels}
          getRowId={(product) => product.id}
          enableSelection
          bulkActions={(_selected, clearSelection) => (
            <Button variant="secondary" size="sm" onClick={clearSelection}>
              {t("table.archive")}
            </Button>
          )}
          pageSize={5}
        />
        <EmptyState
          icon={<ShoppingBag />}
          title={t("data.emptyTitle")}
          description={t("data.emptyBody")}
          action={
            <Button>
              <Plus />
              {t("buttons.newProduct")}
            </Button>
          }
        />
      </Section>

      <Section id="spaces" title={t("sections.spaces")}>
        <p className="text-sm text-foreground/70">{t("spaces.accentNote")}</p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {workspaceItems.map((workspace, index) => (
            <WorkspaceTile
              key={workspace.id}
              selected={workspace.id === workspaceId}
              onClick={() => setWorkspaceId(workspace.id)}
              name={workspace.name}
              description={workspace.description}
              initials={workspace.initials}
              icon={workspace.icon}
              color={workspace.color}
              badge={
                index === 0
                  ? t("spaces.global")
                  : t("spaces.pending", { count: index * 2 })
              }
            />
          ))}
          <WorkspaceTile
            variant="create"
            name={t("spaces.create")}
            description={t("spaces.createDescription")}
          />
        </div>
      </Section>

      <Toaster
        label={t("overlays.toastLabel")}
        viewportLabel={t("overlays.toastRegion", { hotkey: "{hotkey}" })}
        closeLabel={t("overlays.close")}
      />
    </AppShell>
  );
}
