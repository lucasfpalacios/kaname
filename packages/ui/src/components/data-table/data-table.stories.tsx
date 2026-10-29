import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Archive,
  Copy,
  MoreHorizontal,
  Package,
  Pencil,
  Plus,
  Tag,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { storyMessages } from "../../stories/messages";
import { storyIntlLocale } from "../../stories/story-row";
import {
  type ProductCategoryKey,
  products,
  type TankVaultProduct,
} from "../../stories/tank-vault";
import { Avatar, AvatarFallback } from "../avatar";
import { Badge } from "../badge";
import { Button } from "../button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { EmptyState } from "../empty-state";
import { IconButton } from "../icon-button";
import { MoneyText } from "../money-text";
import { StatusBadge } from "../status-badge";
import {
  createDataTableColumnHelper,
  DataTable,
  type DataTableLabels,
} from "./data-table";

const meta = {
  title: "Datos/DataTable",
  component: DataTable,
  // Las stories renderizan su propia tabla; estos args solo cumplen el tipo de las props.
  args: {
    columns: [],
    data: [],
    labels: {} as never,
    getRowId: () => "",
  },
} satisfies Meta<typeof DataTable>;

export default meta;

type Story = StoryObj<typeof meta>;

const helper = createDataTableColumnHelper<TankVaultProduct>();

const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key]));

// En la app, todo esto sale de next-intl; acá de los textos de las stories.
function useProductTable(storyLocale: unknown) {
  const t = storyMessages(storyLocale);
  const p = t.table;
  const locale = storyIntlLocale(storyLocale);

  const labels: DataTableLabels<TankVaultProduct> = {
    search: p.search,
    selectAll: p.selectAll,
    selectRow: (product) => fill(p.selectRow, { name: product.name }),
    selected: (count) =>
      count === 1 ? p.selectedOne : fill(p.selectedMany, { count }),
    clearSelection: p.clearSelection,
    clearFilters: p.clearFilters,
    noResults: p.noResults,
    noResultsDescription: p.noResultsDescription,
    empty: p.empty,
    pageInfo: (range) => fill(p.pageInfo, range),
    pageOf: (page) => fill(p.pageOf, page),
    previousPage: p.previousPage,
    nextPage: p.nextPage,
    rowsPerPage: p.rowsPerPage,
  };

  const columns = useMemo(() => {
    const percent = new Intl.NumberFormat(locale, {
      style: "percent",
      maximumFractionDigits: 1,
    });
    return helper.columns([
      helper.display({
        id: "image",
        header: p.image,
        cell: ({ row }) => (
          <Avatar className="rounded-md">
            <AvatarFallback className="rounded-md text-xs">
              {row.original.initials}
            </AvatarFallback>
          </Avatar>
        ),
      }),
      // Se busca por nombre y por SKU; se ordena por nombre.
      helper.accessor((row) => `${row.name} ${row.sku}`, {
        id: "product",
        header: p.product,
        cell: ({ row }) => (
          <div className="min-w-56">
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.sku}</p>
          </div>
        ),
      }),
      helper.accessor("category", {
        header: p.category,
        filterFn: "equals",
        enableGlobalFilter: false,
        cell: ({ getValue }) => (
          <Badge variant="secondary">{p.categories[getValue()]}</Badge>
        ),
      }),
      helper.accessor("stock", {
        header: p.stock,
        enableGlobalFilter: false,
        meta: { numeric: true },
        cell: ({ row }) => {
          const { stock, reorderPoint } = row.original;
          const text = `${stock} ${t.data.kpis.units}`;
          return stock <= reorderPoint ? (
            <StatusBadge tone="warning" label={`${text} (${p.low})`} />
          ) : (
            text
          );
        },
      }),
      // Los montos se ordenan como número; la celda muestra el string decimal.
      helper.accessor((row) => Number(row.cost), {
        id: "cost",
        header: p.cost,
        enableGlobalFilter: false,
        meta: { numeric: true },
        cell: ({ row }) => (
          <MoneyText
            value={row.original.cost}
            currency="ARS"
            locale={locale}
            hideDecimals
          />
        ),
      }),
      helper.accessor((row) => Number(row.price), {
        id: "price",
        header: p.price,
        enableGlobalFilter: false,
        meta: { numeric: true },
        cell: ({ row }) => (
          <MoneyText
            value={row.original.price}
            currency="ARS"
            locale={locale}
            hideDecimals
            className="font-medium"
          />
        ),
      }),
      helper.accessor(
        (row) => (Number(row.price) - Number(row.cost)) / Number(row.price),
        {
          id: "margin",
          header: p.margin,
          enableGlobalFilter: false,
          meta: { numeric: true },
          cell: ({ getValue }) => percent.format(getValue()),
        },
      ),
      helper.accessor("supplier", {
        header: p.supplier,
        filterFn: "equals",
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap">{getValue()}</span>
        ),
      }),
      helper.display({
        id: "actions",
        header: () => <span className="sr-only">{p.actions}</span>,
        meta: { className: "w-12" },
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton
                label={`${p.actions}: ${row.original.name}`}
                size="sm"
              >
                <MoreHorizontal />
              </IconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Pencil />
                {t.actions.edit}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy />
                {t.menu.duplicate}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                <Trash2 />
                {t.actions.delete}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      }),
    ]);
  }, [locale, p, t]);

  const categoryKeys = Object.keys(p.categories) as ProductCategoryKey[];
  const suppliers = [...new Set(products.map((product) => product.supplier))];
  const filters = [
    {
      columnId: "category",
      label: p.category,
      allLabel: p.allCategories,
      options: categoryKeys.map((key) => ({
        value: key,
        label: p.categories[key],
      })),
    },
    {
      columnId: "supplier",
      label: p.supplier,
      allLabel: p.allSuppliers,
      options: suppliers.map((name) => ({ value: name, label: name })),
    },
  ];

  return { t, p, labels, columns, filters };
}

function ProductTable({
  locale,
  loading,
  empty,
}: {
  locale: unknown;
  loading?: boolean;
  empty?: boolean;
}) {
  const { t, p, labels, columns, filters } = useProductTable(locale);
  return (
    <DataTable
      columns={columns}
      data={empty ? [] : products}
      labels={labels}
      getRowId={(product) => product.id}
      filters={filters}
      enableSelection
      bulkActions={(_selected, clearSelection) => (
        <>
          <Button variant="secondary" size="sm">
            <Tag />
            {p.updatePrices}
          </Button>
          <Button variant="secondary" size="sm" onClick={clearSelection}>
            <Archive />
            {p.archive}
          </Button>
        </>
      )}
      toolbar={
        <Button>
          <Plus />
          {t.actions.newProduct}
        </Button>
      }
      pageSize={6}
      pageSizeOptions={[6, 10, 20]}
      loading={loading}
      emptyState={
        <EmptyState
          variant="plain"
          icon={<Package />}
          title={p.empty}
          description={p.emptyDescription}
          action={
            <Button>
              <Plus />
              {t.actions.newProduct}
            </Button>
          }
        />
      }
    />
  );
}

// Productos de Tank Vault como en la pantalla de Stitch: ordená por columna, buscá
// "pokemon" (sin tilde), filtrá por categoría o proveedor y seleccioná filas.
export const Productos: Story = {
  render: (_args, { globals }) => <ProductTable locale={globals.locale} />,
};

export const ProductosOscuro: Story = {
  name: "Productos (oscuro)",
  globals: { theme: "oscuro" },
  render: (_args, { globals }) => <ProductTable locale={globals.locale} />,
};

export const Cargando: Story = {
  render: (_args, { globals }) => (
    <ProductTable locale={globals.locale} loading />
  ),
};

export const Vacio: Story = {
  name: "Vacío",
  render: (_args, { globals }) => (
    <ProductTable locale={globals.locale} empty />
  ),
};

// Modo servidor: la búsqueda, los filtros y la página los resuelve "la API" (acá, un filtro sobre
// los productos de ejemplo). La tabla recibe solo la página y el total; no ordena por columna.
function ServerTable({ locale }: { locale: unknown }) {
  const { p, labels, columns, filters } = useProductTable(locale);
  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState<
    Record<string, string | undefined>
  >({});
  const [page, setPage] = useState(1);
  const pageSize = 3;
  const matching = products.filter(
    (product) =>
      (!search ||
        `${product.name} ${product.sku}`
          .toLowerCase()
          .includes(search.toLowerCase())) &&
      (!filterValues.category || product.category === filterValues.category) &&
      (!filterValues.supplier || product.supplier === filterValues.supplier),
  );
  return (
    <DataTable
      columns={columns}
      data={matching.slice((page - 1) * pageSize, page * pageSize)}
      labels={labels}
      getRowId={(product) => product.id}
      filters={filters}
      server={{
        total: matching.length,
        page,
        pageSize,
        onPageChange: setPage,
        search,
        onSearchChange: (value) => {
          setSearch(value);
          setPage(1);
        },
        filterValues,
        onFilterChange: (columnId, value) => {
          setFilterValues((current) => ({ ...current, [columnId]: value }));
          setPage(1);
        },
        onClearFilters: () => {
          setSearch("");
          setFilterValues({});
          setPage(1);
        },
      }}
      emptyState={<EmptyState variant="plain" title={p.empty} />}
    />
  );
}

export const ModoServidor: Story = {
  name: "Modo servidor",
  render: (_args, { globals }) => <ServerTable locale={globals.locale} />,
};
