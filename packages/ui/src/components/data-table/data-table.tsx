"use client";

import {
  type ColumnDef,
  columnFilteringFeature,
  constructFilterFn,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_equals,
  filterFn_includesString,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  type RowData,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_text,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import { type ReactNode, useMemo } from "react";
import { cn } from "../../lib/cn";
import { controlGroup, controlGroupInput } from "../../lib/control";
import { focusRing } from "../../lib/focus-ring";
import { Button } from "../button";
import { Checkbox } from "../checkbox";
import { EmptyState } from "../empty-state";
import { IconButton } from "../icon-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";
import { Skeleton } from "../skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../table";

// Tabla de datos sobre TanStack Table 9: orden por columna, búsqueda, filtros por columna,
// paginación y selección con acciones masivas. Todo en el cliente; para listas que no entran en
// memoria hará falta el modo manual (server-side). Las columnas llevan funciones de render, así
// que la página que la usa es un componente cliente.

export type DataTableColumnMeta = {
  /**
   * Columna numérica: alineada a la derecha, con tabular-nums y sin cortar.
   *
   * Solo alinea, no cambia cómo se ordena. Los montos llegan como string decimal ("85000"), que
   * se ordena como texto ("85000" > "345000"); por eso el accessor tiene que devolver un número y
   * la celda mostrar el string original:
   * `helper.accessor((row) => Number(row.price), { id: "price", meta: { numeric: true }, cell: ... })`
   */
  numeric?: boolean;
  /** Clases extra para el th y los td de la columna (por ejemplo un ancho). */
  className?: string;
};

// "Pokemon" encuentra "Pokémon": la búsqueda ignora mayúsculas y tildes.
const normalize = (value: unknown) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

const includesText = constructFilterFn({
  ...filterFn_includesString,
  resolveFilterValue: normalize,
  resolveDataValue: normalize,
});

export const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  columnFilteringFeature,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns: { includesText, equals: filterFn_equals },
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    basic: sortFn_basic,
    text: sortFn_text,
  },
  columnMeta: {} as DataTableColumnMeta,
});

export type DataTableFeatures = typeof dataTableFeatures;

export type DataTableColumnDef<TData extends RowData> = ColumnDef<
  DataTableFeatures,
  TData,
  // Cada columna tiene su tipo de valor; con unknown no entrarían en el mismo array.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any
>;

/** Column helper tipado con las features de DataTable. */
export const createDataTableColumnHelper = <TData extends RowData>() =>
  createColumnHelper<DataTableFeatures, TData>();

export type DataTableFilter = {
  /** id de la columna que filtra (la columna usa filterFn: "equals"). */
  columnId: string;
  label: string;
  /** Texto de la opción que muestra todo ("Todas las categorías"). */
  allLabel: string;
  options: { value: string; label: string }[];
};

export type DataTableLabels<TData = never> = {
  /** aria-label y placeholder del buscador. */
  search: string;
  selectAll: string;
  /**
   * Nombre del checkbox de cada fila. Con una función, cada fila se distingue para los lectores de
   * pantalla ("Seleccionar Booster Box Surging Sparks").
   */
  selectRow: string | ((row: TData) => string);
  /** "3 productos seleccionados". */
  selected: (count: number) => string;
  clearSelection: string;
  clearFilters: string;
  /** Sin resultados para la búsqueda o los filtros. */
  noResults: string;
  noResultsDescription?: string;
  /** Sin datos, si no se pasa `emptyState`. */
  empty: string;
  /** "Mostrando 1 a 6 de 14 productos". */
  pageInfo: (range: { from: number; to: number; total: number }) => string;
  /** "Página 1 de 3". */
  pageOf: (page: { page: number; count: number }) => string;
  previousPage: string;
  nextPage: string;
  rowsPerPage: string;
};

export type DataTableProps<TData extends RowData> = {
  columns: DataTableColumnDef<TData>[];
  data: TData[];
  labels: DataTableLabels<TData>;
  /**
   * id real de cada fila (el id de la base). Es obligatorio: la selección y las acciones masivas
   * operan sobre estos ids, nunca sobre índices, así sobreviven a ordenar, filtrar y paginar.
   */
  getRowId: (row: TData) => string;
  filters?: DataTableFilter[];
  /** Agrega una columna de checkboxes y la barra de acciones masivas. */
  enableSelection?: boolean;
  /** Botones de la barra que aparece al seleccionar filas. */
  bulkActions?: (selected: TData[], clearSelection: () => void) => ReactNode;
  /** Botones a la derecha de la barra de herramientas ("Nuevo producto"). */
  toolbar?: ReactNode;
  pageSize?: number;
  /** Si se pasa, muestra el selector de filas por página. */
  pageSizeOptions?: number[];
  loading?: boolean;
  /** Lo que se muestra cuando `data` está vacío (un EmptyState con acción). */
  emptyState?: ReactNode;
  className?: string;
};

const ALL = "__all";

function numericClass(meta: DataTableColumnMeta | undefined) {
  return cn(
    meta?.numeric && "text-right tabular-nums whitespace-nowrap",
    meta?.className,
  );
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  labels,
  getRowId,
  filters = [],
  enableSelection = false,
  bulkActions,
  toolbar,
  pageSize = 10,
  pageSizeOptions,
  loading = false,
  emptyState,
  className,
}: DataTableProps<TData>) {
  const { selectAll, selectRow } = labels;
  const allColumns = useMemo<DataTableColumnDef<TData>[]>(() => {
    if (!enableSelection) return columns;
    const select: DataTableColumnDef<TData> = {
      id: "select",
      enableSorting: false,
      enableGlobalFilter: false,
      header: ({ table }) => (
        <Checkbox
          aria-label={selectAll}
          checked={
            table.getIsAllPageRowsSelected()
              ? true
              : table.getIsSomePageRowsSelected()
                ? "indeterminate"
                : false
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label={
            typeof selectRow === "function"
              ? selectRow(row.original)
              : selectRow
          }
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
    };
    return [select, ...columns];
  }, [columns, enableSelection, selectAll, selectRow]);

  const table = useTable({
    features: dataTableFeatures,
    columns: allColumns,
    data,
    getRowId: (row) => getRowId(row),
    globalFilterFn: "includesText",
    enableRowSelection: enableSelection,
    initialState: { pagination: { pageIndex: 0, pageSize } },
  });

  const { globalFilter, columnFilters, pagination } = table.state;
  const selectedRows = table.getSelectedRowModel().rows;
  const filtered = Boolean(globalFilter) || columnFilters.length > 0;
  const total = table.getFilteredRowModel().rows.length;
  const from = total === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1;
  const to = Math.min(total, (pagination.pageIndex + 1) * pagination.pageSize);
  const pageCount = Math.max(1, table.getPageCount());
  const columnCount = allColumns.length;
  // Sin datos no hay qué buscar ni filtrar; sin filas visibles no hay qué paginar.
  const hasData = loading || data.length > 0;
  const showFooter = !loading && total > 0;

  const clearFilters = () => {
    table.resetGlobalFilter(true);
    table.resetColumnFilters(true);
  };
  const clearSelection = () => table.resetRowSelection(true);

  let body: ReactNode;
  if (loading) {
    body = Array.from({ length: pagination.pageSize }, (_, index) => (
      <TableRow key={index} className="hover:bg-transparent">
        {table.getAllLeafColumns().map((column) => (
          <TableCell key={column.id}>
            <Skeleton className="h-4 w-full max-w-32" />
          </TableCell>
        ))}
      </TableRow>
    ));
  } else if (table.getRowModel().rows.length === 0) {
    body = (
      <TableRow className="hover:bg-transparent">
        <TableCell colSpan={columnCount} className="p-0">
          {data.length === 0 ? (
            (emptyState ?? <EmptyState variant="plain" title={labels.empty} />)
          ) : (
            <EmptyState
              variant="plain"
              icon={<Search />}
              title={labels.noResults}
              description={labels.noResultsDescription}
              action={
                <Button variant="secondary" onClick={clearFilters}>
                  {labels.clearFilters}
                </Button>
              }
            />
          )}
        </TableCell>
      </TableRow>
    );
  } else {
    body = table.getRowModel().rows.map((row) => (
      <TableRow
        key={row.id}
        data-state={row.getIsSelected() ? "selected" : undefined}
      >
        {row.getAllCells().map((cell) => (
          <TableCell
            key={cell.id}
            className={numericClass(cell.column.columnDef.meta)}
          >
            <table.FlexRender cell={cell} />
          </TableCell>
        ))}
      </TableRow>
    ));
  }

  return (
    <div
      data-slot="data-table"
      className={cn(
        "flex flex-col gap-4 rounded-lg border border-border bg-card text-foreground",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-3 px-4 pt-4">
        {hasData && (
          <>
            <label className={cn(controlGroup, "w-full sm:max-w-xs")}>
              <Search
                aria-hidden="true"
                className="ml-3 size-4 shrink-0 text-foreground/60"
              />
              <input
                type="search"
                aria-label={labels.search}
                placeholder={labels.search}
                value={String(globalFilter ?? "")}
                onChange={(event) => table.setGlobalFilter(event.target.value)}
                className={controlGroupInput}
              />
            </label>
            {filters.map((filter) => {
              const column = table.getColumn(filter.columnId);
              const value =
                (column?.getFilterValue() as string | undefined) ?? ALL;
              return (
                <Select
                  key={filter.columnId}
                  value={value}
                  onValueChange={(next) =>
                    column?.setFilterValue(next === ALL ? undefined : next)
                  }
                >
                  <SelectTrigger
                    aria-label={filter.label}
                    className="w-auto min-w-44"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>{filter.allLabel}</SelectItem>
                    {filter.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              );
            })}
            {filtered && (
              <Button variant="ghost" onClick={clearFilters}>
                <X />
                {labels.clearFilters}
              </Button>
            )}
          </>
        )}
        {toolbar && <div className="ml-auto flex gap-2">{toolbar}</div>}
      </div>

      {enableSelection && selectedRows.length > 0 && (
        <div
          role="status"
          className="mx-4 flex flex-wrap items-center gap-3 rounded-md border border-primary/30 bg-primary/5 px-4 py-2 text-sm"
        >
          <span className="font-medium">
            {labels.selected(selectedRows.length)}
          </span>
          <div className="ml-auto flex flex-wrap gap-2">
            {bulkActions?.(
              selectedRows.map((row) => row.original),
              clearSelection,
            )}
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              {labels.clearSelection}
            </Button>
          </div>
        </div>
      )}

      <Table aria-busy={loading || undefined}>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id} className="hover:bg-transparent">
              {group.headers.map((header) => {
                const sorted = header.column.getIsSorted();
                const numeric = header.column.columnDef.meta?.numeric;
                return (
                  <TableHead
                    key={header.id}
                    aria-sort={
                      sorted === "asc"
                        ? "ascending"
                        : sorted === "desc"
                          ? "descending"
                          : undefined
                    }
                    className={numericClass(header.column.columnDef.meta)}
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className={cn(
                          "-mx-1 inline-flex cursor-pointer items-center gap-1 rounded-sm px-1 tracking-label uppercase hover:text-foreground",
                          numeric && "flex-row-reverse",
                          focusRing,
                        )}
                      >
                        <table.FlexRender header={header} />
                        {sorted === "asc" ? (
                          <ArrowUp aria-hidden="true" className="size-3.5" />
                        ) : sorted === "desc" ? (
                          <ArrowDown aria-hidden="true" className="size-3.5" />
                        ) : (
                          <ArrowUpDown
                            aria-hidden="true"
                            className="size-3.5 opacity-50"
                          />
                        )}
                      </button>
                    ) : (
                      <table.FlexRender header={header} />
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>{body}</TableBody>
      </Table>

      {showFooter && (
        <div className="flex flex-wrap items-center gap-3 px-4 pb-4 text-sm text-foreground/70">
          <span className="tabular-nums">
            {labels.pageInfo({ from, to, total })}
          </span>
          <div className="ml-auto flex flex-wrap items-center gap-3">
            {pageSizeOptions && (
              <div className="flex items-center gap-2">
                <span>{labels.rowsPerPage}</span>
                <Select
                  value={String(pagination.pageSize)}
                  onValueChange={(next) => table.setPageSize(Number(next))}
                >
                  <SelectTrigger
                    aria-label={labels.rowsPerPage}
                    className="h-8 w-20"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pageSizeOptions.map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <span className="tabular-nums">
              {labels.pageOf({
                page: pagination.pageIndex + 1,
                count: pageCount,
              })}
            </span>
            <div className="flex gap-1">
              <IconButton
                label={labels.previousPage}
                variant="secondary"
                size="sm"
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.previousPage()}
              >
                <ChevronLeft />
              </IconButton>
              <IconButton
                label={labels.nextPage}
                variant="secondary"
                size="sm"
                disabled={!table.getCanNextPage()}
                onClick={() => table.nextPage()}
              >
                <ChevronRight />
              </IconButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
