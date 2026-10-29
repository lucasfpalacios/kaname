import type {
  CategoryInput,
  CategorySummary,
  CreateProductInput,
  GenerateVariantsInput,
  ProductCombination,
  ProductDetail,
  ProductListPage,
  StockAdjustmentInput,
  StockMovementView,
  UpdateProductInput,
  UpdateVariantInput,
  VariantView,
} from "@kaname/shared";
import { getJson, send } from "@/lib/api/send";

// Catálogo del espacio desde el navegador: categorías, productos, variantes y stock.
const base = (workspaceId: string) => `/api/workspaces/${workspaceId}`;

/** Filtros y página del listado, como los manda la pantalla. */
export type ProductListParams = {
  q?: string;
  categoryId?: string;
  kind?: string;
  lowStock?: boolean;
  includeArchived?: boolean;
  page: number;
  pageSize: number;
};

/** Claves de TanStack Query: todo lo del catálogo de un espacio cuelga de ["catalog", id]. */
export const catalogKeys = {
  all: (workspaceId: string) => ["catalog", workspaceId] as const,
  categories: (workspaceId: string) =>
    ["catalog", workspaceId, "categories"] as const,
  products: (workspaceId: string) =>
    ["catalog", workspaceId, "products"] as const,
  list: (workspaceId: string, params: ProductListParams) =>
    ["catalog", workspaceId, "products", "list", params] as const,
  product: (workspaceId: string, productId: string) =>
    ["catalog", workspaceId, "products", "detail", productId] as const,
  movements: (workspaceId: string, variantId: string) =>
    ["catalog", workspaceId, "movements", variantId] as const,
};

export function listProducts(workspaceId: string, params: ProductListParams) {
  const query = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
  });
  if (params.q) query.set("q", params.q);
  if (params.categoryId) query.set("categoryId", params.categoryId);
  if (params.kind) query.set("kind", params.kind);
  if (params.lowStock) query.set("lowStock", "true");
  if (params.includeArchived) query.set("includeArchived", "true");
  return getJson<ProductListPage>(`${base(workspaceId)}/products?${query}`);
}

export const getProduct = (workspaceId: string, productId: string) =>
  getJson<ProductDetail>(`${base(workspaceId)}/products/${productId}`);

export const getCombinations = (workspaceId: string, productId: string) =>
  getJson<ProductCombination[]>(
    `${base(workspaceId)}/products/${productId}/combinations`,
  );

export const createProduct = (workspaceId: string, input: CreateProductInput) =>
  send<ProductDetail>(`${base(workspaceId)}/products`, "POST", input);

export const updateProduct = (
  workspaceId: string,
  productId: string,
  input: UpdateProductInput,
) =>
  send<ProductDetail>(
    `${base(workspaceId)}/products/${productId}`,
    "PATCH",
    input,
  );

export const deleteProduct = (workspaceId: string, productId: string) =>
  send<void>(`${base(workspaceId)}/products/${productId}`, "DELETE");

export const setProductArchived = (
  workspaceId: string,
  productId: string,
  archived: boolean,
) =>
  send<void>(
    `${base(workspaceId)}/products/${productId}/${archived ? "archive" : "restore"}`,
    "POST",
  );

export const generateVariants = (
  workspaceId: string,
  productId: string,
  input: GenerateVariantsInput,
) =>
  send<VariantView[]>(
    `${base(workspaceId)}/products/${productId}/variants`,
    "POST",
    input,
  );

export const updateVariant = (
  workspaceId: string,
  variantId: string,
  input: UpdateVariantInput,
) =>
  send<VariantView>(
    `${base(workspaceId)}/variants/${variantId}`,
    "PATCH",
    input,
  );

export const adjustStock = (
  workspaceId: string,
  variantId: string,
  input: StockAdjustmentInput,
) =>
  send<{ variant: VariantView; movement: StockMovementView }>(
    `${base(workspaceId)}/variants/${variantId}/stock-adjustments`,
    "POST",
    input,
  );

export const getMovements = (workspaceId: string, variantId: string) =>
  getJson<StockMovementView[]>(
    `${base(workspaceId)}/variants/${variantId}/stock-movements`,
  );

export const listCategories = (workspaceId: string) =>
  getJson<CategorySummary[]>(`${base(workspaceId)}/categories`);

export const createCategory = (workspaceId: string, input: CategoryInput) =>
  send<CategorySummary>(`${base(workspaceId)}/categories`, "POST", input);

export const updateCategory = (
  workspaceId: string,
  categoryId: string,
  input: Partial<CategoryInput>,
) =>
  send<CategorySummary>(
    `${base(workspaceId)}/categories/${categoryId}`,
    "PATCH",
    input,
  );

export const deleteCategory = (workspaceId: string, categoryId: string) =>
  send<void>(`${base(workspaceId)}/categories/${categoryId}`, "DELETE");
