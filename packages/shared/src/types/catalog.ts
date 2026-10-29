import type { Currency, ProductKind, StockMovementType } from "../enums.js";
import type { OptionValues, ProductOptions } from "../schemas/catalog.js";

// Respuestas de la API del catálogo. Montos y cantidades, como string decimal ("135.00", "2.000").

/** Una categoría del espacio (GET /categories). */
export type CategorySummary = {
  id: string;
  name: string;
  parentId: string | null;
  productCount: number;
};

/** Una variante, como la devuelven el detalle y la edición. */
export type VariantView = {
  id: string;
  name: string | null;
  sku: string | null;
  barcode: string | null;
  optionValues: OptionValues;
  costAmount: string;
  costCurrency: Currency;
  stock: string;
  unit: string;
  reorderPoint: string | null;
  trackStock: boolean;
  defaultSupplierId: string | null;
  isDefault: boolean;
  isActive: boolean;
  /** Activa, con stock controlado y en o debajo de su punto de reposición. */
  lowStock: boolean;
};

/** Una fila del listado de productos. */
export type ProductListItem = {
  id: string;
  name: string;
  kind: ProductKind;
  isActive: boolean;
  category: { id: string; name: string } | null;
  variantCount: number;
  /** El SKU si tiene una sola variante. */
  sku: string | null;
  /** El menor costo de las variantes (en la moneda de la primera); `varies` si alguna tiene otro. */
  cost: { amount: string; currency: Currency; varies: boolean } | null;
  supplier: string | null;
  /** Suma del stock de las variantes que lo controlan. */
  totalStock: string;
  lowStock: boolean;
};

export type ProductListPage = {
  items: ProductListItem[];
  total: number;
  page: number;
  pageSize: number;
};

/** Un producto con sus variantes (GET /products/:productId). */
export type ProductDetail = {
  id: string;
  name: string;
  kind: ProductKind;
  description: string | null;
  options: ProductOptions;
  isActive: boolean;
  category: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
  variants: VariantView[];
};

/** Una combinación de las opciones del producto y la variante que la usa, si existe. */
export type ProductCombination = {
  optionValues: OptionValues;
  name: string;
  variantId: string | null;
};

export type StockMovementView = {
  id: string;
  type: StockMovementType;
  quantity: string;
  note: string | null;
  createdAt: string;
};
