"use client";

import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  createDataTableColumnHelper,
  DataTable,
  type DataTableLabels,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  EmptyState,
  IconButton,
  MoneyText,
  PageHeader,
  StatusBadge,
  toast,
} from "@kaname/ui";
import {
  type Currency,
  type ModulePermissions,
  type ProductListItem,
  productKindSchema,
} from "@kaname/shared";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  Archive,
  ArchiveRestore,
  Eye,
  MoreHorizontal,
  Package,
  Pencil,
  Plus,
  Tags,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import {
  catalogKeys,
  listProducts,
  type ProductListParams,
  setProductArchived,
} from "@/lib/catalog/api";
import { workspaceInitials } from "@/lib/workspaces/modules";
import { CategoriesDialog } from "./categories-dialog";
import { DeleteProductDialog } from "./delete-product-dialog";
import { ProductFormDialog } from "./product-form-dialog";
import { ProductSheet } from "./product-sheet";
import {
  categoryOptions,
  useCatalogFormat,
  useCategories,
  useRefreshCatalog,
} from "./use-catalog";

const helper = createDataTableColumnHelper<ProductListItem>();

/** Valores de los filtros "solo stock bajo" y "con archivados" (selects de una opción). */
const LOW = "low";
const ARCHIVED = "archived";

// Pantalla de productos: el listado (búsqueda, filtros y páginas en la API), el detalle en un
// Sheet, el alta y la edición en un diálogo y las categorías en otro. Los botones de crear, editar
// y borrar solo aparecen con ese permiso (la API igual lo valida).
export function ProductsScreen({
  workspaceId,
  workspaceName,
  baseCurrency,
  permissions,
}: {
  workspaceId: string;
  workspaceName: string;
  baseCurrency: Currency;
  permissions: ModulePermissions;
}) {
  const t = useTranslations("Products");
  const tModules = useTranslations("Modules");
  const format = useCatalogFormat();
  const refresh = useRefreshCatalog(workspaceId);
  const categories = useCategories(workspaceId);

  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<Record<string, string | undefined>>(
    {},
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [detailId, setDetailId] = useState<string | null>(null);
  // Alta (sin id) o edición (con id) en el diálogo del formulario.
  const [form, setForm] = useState<{ productId: string | null } | null>(null);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [toDelete, setToDelete] = useState<ProductListItem | null>(null);

  // La búsqueda va a la API 300 ms después de la última tecla.
  useEffect(() => {
    const timer = setTimeout(() => setQ(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const params: ProductListParams = {
    q: q || undefined,
    categoryId: filters.category,
    kind: filters.kind,
    lowStock: filters.stock === LOW,
    includeArchived: filters.status === ARCHIVED,
    page,
    pageSize,
  };
  const list = useQuery({
    queryKey: catalogKeys.list(workspaceId, params),
    queryFn: () => listProducts(workspaceId, params),
    // Al cambiar de página o filtro, la tabla sigue mostrando la anterior hasta que llega la nueva.
    placeholderData: keepPreviousData,
  });

  async function setArchived(product: ProductListItem, archived: boolean) {
    const result = await setProductArchived(workspaceId, product.id, archived);
    if (!result.ok) {
      toast({ title: t("saveError"), variant: "destructive" });
      return;
    }
    toast({
      title: t(archived ? "archived" : "restored", { name: product.name }),
      variant: "success",
    });
    void refresh();
  }

  const canChange = permissions.edit || permissions.delete;

  const columns = useMemo(
    () =>
      helper.columns([
        helper.display({
          id: "image",
          header: t("columns.image"),
          meta: { className: "w-14" },
          cell: ({ row }) => (
            <Avatar className="rounded-md" aria-hidden="true">
              <AvatarFallback className="rounded-md text-xs">
                {workspaceInitials(row.original.name)}
              </AvatarFallback>
            </Avatar>
          ),
        }),
        helper.display({
          id: "product",
          header: t("columns.product"),
          cell: ({ row }) => {
            const product = row.original;
            return (
              <div className="flex min-w-56 flex-col items-start gap-0.5">
                {/* El nombre abre el detalle. */}
                <button
                  type="button"
                  onClick={() => setDetailId(product.id)}
                  className="cursor-pointer text-left font-medium hover:underline focus-visible:underline focus-visible:outline-none"
                >
                  {product.name}
                </button>
                <span className="flex items-center gap-2 text-xs text-foreground/70">
                  <span className="font-mono">
                    {product.variantCount > 1
                      ? t("variantCount", { count: product.variantCount })
                      : (product.sku ?? t("noSku"))}
                  </span>
                  {!product.isActive && (
                    <Badge variant="secondary">{t("archivedBadge")}</Badge>
                  )}
                </span>
              </div>
            );
          },
        }),
        helper.display({
          id: "category",
          header: t("columns.category"),
          cell: ({ row }) =>
            row.original.category ? (
              <Badge variant="secondary">{row.original.category.name}</Badge>
            ) : (
              <span className="text-foreground/50">—</span>
            ),
        }),
        helper.display({
          id: "stock",
          header: t("columns.stock"),
          meta: { numeric: true },
          cell: ({ row }) => {
            const product = row.original;
            const text = t("units", {
              quantity: format.quantity(product.totalStock),
            });
            return product.lowStock ? (
              <StatusBadge tone="warning" label={t("lowStock", { text })} />
            ) : (
              text
            );
          },
        }),
        helper.display({
          id: "cost",
          header: t("columns.cost"),
          meta: { numeric: true },
          cell: ({ row }) => {
            const { cost } = row.original;
            if (!cost) return "—";
            const money = (
              <MoneyText
                value={cost.amount}
                currency={cost.currency}
                locale={format.locale}
              />
            );
            // Con variantes de distinto costo, el de la primera como "desde".
            return cost.varies ? t.rich("from", { money: () => money }) : money;
          },
        }),
        helper.display({
          id: "price",
          header: t("columns.price"),
          meta: { numeric: true },
          // Los precios salen de las listas de precios (Fase 4).
          cell: () => (
            <span className="text-foreground/50" title={t("priceSoon")}>
              —
            </span>
          ),
        }),
        helper.display({
          id: "supplier",
          header: t("columns.supplier"),
          cell: ({ row }) => (
            <span className="whitespace-nowrap">
              {row.original.supplier ?? "—"}
            </span>
          ),
        }),
        helper.display({
          id: "actions",
          header: () => <span className="sr-only">{t("columns.actions")}</span>,
          meta: { className: "w-12" },
          cell: ({ row }) => {
            const product = row.original;
            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <IconButton
                    label={t("actionsFor", { name: product.name })}
                    size="sm"
                  >
                    <MoreHorizontal />
                  </IconButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => setDetailId(product.id)}>
                    <Eye />
                    {t("viewDetail")}
                  </DropdownMenuItem>
                  {permissions.edit && (
                    <DropdownMenuItem
                      onSelect={() => setForm({ productId: product.id })}
                    >
                      <Pencil />
                      {t("edit")}
                    </DropdownMenuItem>
                  )}
                  {canChange && <DropdownMenuSeparator />}
                  {permissions.edit &&
                    (product.isActive ? (
                      <DropdownMenuItem
                        onSelect={() => void setArchived(product, true)}
                      >
                        <Archive />
                        {t("archive")}
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onSelect={() => void setArchived(product, false)}
                      >
                        <ArchiveRestore />
                        {t("restore")}
                      </DropdownMenuItem>
                    ))}
                  {permissions.delete && (
                    <DropdownMenuItem
                      variant="destructive"
                      onSelect={() => setToDelete(product)}
                    >
                      <Trash2 />
                      {t("delete")}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          },
        }),
      ]),
    // setArchived cambia en cada render pero solo usa props estables y refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, format, permissions, canChange],
  );

  const labels: DataTableLabels<ProductListItem> = {
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
    pageOf: (pageInfo) => t("table.pageOf", pageInfo),
    previousPage: t("table.previousPage"),
    nextPage: t("table.nextPage"),
    rowsPerPage: t("table.rowsPerPage"),
  };

  const newButton = permissions.create && (
    <Button onClick={() => setForm({ productId: null })}>
      <Plus />
      {t("new")}
    </Button>
  );

  const total = list.data?.total;

  return (
    <>
      <PageHeader
        title={tModules("PRODUCTS")}
        module="PRODUCTS"
        description={workspaceName}
        badge={
          total !== undefined && (
            <Badge variant="secondary">{t("count", { count: total })}</Badge>
          )
        }
        actions={
          <>
            <Button variant="secondary" onClick={() => setCategoriesOpen(true)}>
              <Tags />
              {t("categories.title")}
            </Button>
            {newButton}
          </>
        }
      />
      <DataTable
        columns={columns}
        data={list.data?.items ?? []}
        labels={labels}
        getRowId={(product) => product.id}
        loading={list.isPending}
        pageSizeOptions={[10, 25, 50]}
        filters={[
          {
            columnId: "category",
            label: t("columns.category"),
            allLabel: t("filters.allCategories"),
            options: categoryOptions(categories.data ?? []),
          },
          {
            columnId: "kind",
            label: t("fields.kind"),
            allLabel: t("filters.allKinds"),
            options: productKindSchema.options.map((kind) => ({
              value: kind,
              label: t(`kinds.${kind}`),
            })),
          },
          {
            columnId: "stock",
            label: t("columns.stock"),
            allLabel: t("filters.anyStock"),
            options: [{ value: LOW, label: t("filters.lowOnly") }],
          },
          {
            columnId: "status",
            label: t("filters.status"),
            allLabel: t("filters.activeOnly"),
            options: [{ value: ARCHIVED, label: t("filters.withArchived") }],
          },
        ]}
        server={{
          total: total ?? 0,
          page,
          pageSize,
          onPageChange: setPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setPage(1);
          },
          search,
          onSearchChange: (value) => {
            setSearch(value);
            setPage(1);
          },
          filterValues: filters,
          onFilterChange: (columnId, value) => {
            setFilters((current) => ({ ...current, [columnId]: value }));
            setPage(1);
          },
          onClearFilters: () => {
            setSearch("");
            setFilters({});
            setPage(1);
          },
        }}
        emptyState={
          list.isError ? (
            <EmptyState
              variant="plain"
              title={t("loadError")}
              action={
                <Button variant="secondary" onClick={() => void list.refetch()}>
                  {t("retry")}
                </Button>
              }
            />
          ) : (
            <EmptyState
              variant="plain"
              icon={<Package />}
              title={t("emptyTitle")}
              description={t("emptyDescription")}
              action={newButton}
            />
          )
        }
      />
      <ProductSheet
        workspaceId={workspaceId}
        productId={detailId}
        onClose={() => setDetailId(null)}
        permissions={permissions}
        onEdit={(productId) => setForm({ productId })}
      />
      {form && (
        <ProductFormDialog
          workspaceId={workspaceId}
          baseCurrency={baseCurrency}
          productId={form.productId}
          onClose={() => setForm(null)}
          onSaved={(productId) => {
            setForm(null);
            void refresh();
            setDetailId(productId);
          }}
        />
      )}
      <CategoriesDialog
        workspaceId={workspaceId}
        open={categoriesOpen}
        onOpenChange={setCategoriesOpen}
        permissions={permissions}
      />
      <DeleteProductDialog
        workspaceId={workspaceId}
        product={toDelete}
        canArchive={permissions.edit}
        onClose={() => setToDelete(null)}
        onDone={() => {
          if (toDelete?.id === detailId) setDetailId(null);
          setToDelete(null);
          void refresh();
        }}
      />
    </>
  );
}
