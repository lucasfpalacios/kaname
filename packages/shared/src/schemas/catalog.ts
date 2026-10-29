import { z } from "zod";
import { currencySchema, productKindSchema } from "../enums.js";
import { ErrorCode } from "../errors/codes.js";

// Catálogo: categorías, productos, variantes y ajustes de stock. Montos y cantidades viajan como
// string decimal (nunca number) para llegar intactos a Prisma.Decimal.

/** Costos: hasta 12 enteros y 2 decimales (Decimal(14, 2)). */
const amount = z
  .string(ErrorCode.moneyInvalid)
  .trim()
  .regex(/^\d{1,12}(\.\d{1,2})?$/, ErrorCode.moneyInvalid);

/** Cantidades de stock: hasta 11 enteros y 3 decimales (Decimal(14, 3)), para kg o litros. */
const quantity = z
  .string(ErrorCode.quantityInvalid)
  .trim()
  .regex(/^\d{1,11}(\.\d{1,3})?$/, ErrorCode.quantityInvalid);

/** Lo mismo, con signo y distinto de cero: un ajuste suma o resta. */
const signedQuantity = z
  .string(ErrorCode.quantityInvalid)
  .trim()
  .regex(/^-?\d{1,11}(\.\d{1,3})?$/, ErrorCode.quantityInvalid)
  .refine((value) => Number(value) !== 0, ErrorCode.quantityInvalid);

const name = z
  .string(ErrorCode.nameRequired)
  .trim()
  .min(1, ErrorCode.nameRequired)
  .max(120, ErrorCode.validationFailed);

/** Texto opcional: vacío cuenta como null. */
const optionalText = (max: number) =>
  z
    .string(ErrorCode.validationFailed)
    .trim()
    .max(max, ErrorCode.validationFailed)
    .transform((value) => value || null)
    .nullable();

const id = z
  .string(ErrorCode.validationFailed)
  .min(1, ErrorCode.validationFailed);

// --- Categorías ---

export const categorySchema = z.object({
  name,
  /** Categoría padre (una raíz del mismo espacio) o null. */
  parentId: id.nullable().default(null),
});

export const updateCategorySchema = categorySchema
  .partial()
  .refine(
    (value) => Object.values(value).some((field) => field !== undefined),
    ErrorCode.validationFailed,
  );

export type CategoryInput = z.input<typeof categorySchema>;

// --- Opciones de variante ---

/**
 * Opciones del producto: [{ name: "Idioma", values: ["EN", "ES"] }, ...]. Nombres sin repetir, y
 * valores sin repetir dentro de cada opción. Hasta 3 opciones y 50 valores por opción.
 */
export const productOptionsSchema = z
  .array(
    z.object({
      name: z
        .string(ErrorCode.optionsInvalid)
        .trim()
        .min(1, ErrorCode.optionsInvalid)
        .max(40, ErrorCode.optionsInvalid),
      values: z
        .array(
          z
            .string(ErrorCode.optionsInvalid)
            .trim()
            .min(1, ErrorCode.optionsInvalid)
            .max(40, ErrorCode.optionsInvalid),
        )
        .min(1, ErrorCode.optionsInvalid)
        .max(50, ErrorCode.optionsInvalid),
    }),
  )
  .max(3, ErrorCode.optionsInvalid)
  .refine(
    (options) =>
      new Set(options.map((option) => option.name.toLowerCase())).size ===
        options.length &&
      options.every(
        (option) =>
          new Set(option.values.map((value) => value.toLowerCase())).size ===
          option.values.length,
      ),
    ErrorCode.optionsInvalid,
  );

export type ProductOptions = z.output<typeof productOptionsSchema>;

/** Valores de una combinación: { Idioma: "EN", Estado: "NM" }. */
export const optionValuesSchema = z.record(
  z.string(ErrorCode.combinationInvalid),
  z.string(ErrorCode.combinationInvalid),
);

export type OptionValues = z.output<typeof optionValuesSchema>;

// --- Variantes ---

/**
 * Lo editable de una variante. El stock no: cambia solo con ajustes (stock-adjustments). Activa o
 * archivada tampoco: se archiva y se restaura con sus propios endpoints.
 */
const variantFields = {
  sku: optionalText(64),
  barcode: optionalText(64),
  costAmount: amount,
  costCurrency: currencySchema,
  unit: z
    .string(ErrorCode.validationFailed)
    .trim()
    .min(1, ErrorCode.validationFailed)
    .max(16, ErrorCode.validationFailed),
  reorderPoint: quantity.nullable(),
  trackStock: z.boolean(ErrorCode.validationFailed),
  defaultSupplierId: id.nullable(),
};

/** Una variante nueva: sus datos y, si se quiere, el stock con el que arranca (como un ajuste). */
export const newVariantSchema = z
  .object(variantFields)
  .partial()
  .extend({ initialStock: quantity.optional() });

export const updateVariantSchema = z
  .object(variantFields)
  .partial()
  .refine(
    (value) => Object.values(value).some((field) => field !== undefined),
    ErrorCode.validationFailed,
  );

export type NewVariantInput = z.input<typeof newVariantSchema>;
export type UpdateVariantInput = z.input<typeof updateVariantSchema>;

/** Generar variantes: las combinaciones elegidas, cada una con sus datos. */
export const generateVariantsSchema = z.object({
  combinations: z
    .array(newVariantSchema.extend({ optionValues: optionValuesSchema }))
    .min(1, ErrorCode.combinationRequired)
    .max(200, ErrorCode.validationFailed),
});

export type GenerateVariantsInput = z.input<typeof generateVariantsSchema>;

// --- Productos ---

export const createProductSchema = z.object({
  name,
  kind: z
    .enum(productKindSchema.options, ErrorCode.validationFailed)
    .default("FINISHED"),
  categoryId: id.nullable().default(null),
  description: optionalText(2000).default(null),
  options: productOptionsSchema.default([]),
  /** Sin opciones: los datos de la variante "default", que se crea sola. */
  variant: newVariantSchema.optional(),
  /** Con opciones: las combinaciones a crear (al menos una). */
  combinations: generateVariantsSchema.shape.combinations.optional(),
});

export const updateProductSchema = z
  .object({
    name,
    kind: z.enum(productKindSchema.options, ErrorCode.validationFailed),
    categoryId: id.nullable(),
    description: optionalText(2000),
    options: productOptionsSchema,
  })
  .partial()
  .refine(
    (value) => Object.values(value).some((field) => field !== undefined),
    ErrorCode.validationFailed,
  );

export type CreateProductInput = z.input<typeof createProductSchema>;
export type UpdateProductInput = z.input<typeof updateProductSchema>;

// --- Stock ---

export const stockAdjustmentSchema = z.object({
  /** Cuánto suma (positivo) o resta (negativo). */
  quantity: signedQuantity,
  note: optionalText(500).optional(),
});

export type StockAdjustmentInput = z.input<typeof stockAdjustmentSchema>;

// --- Listado ---

const flag = z
  .enum(["true", "false"], ErrorCode.validationFailed)
  .transform((value) => value === "true");

/** Query del listado de productos: búsqueda, filtros y paginación. */
export const productListQuerySchema = z.object({
  /** Busca en el nombre, el SKU y el código de barras. */
  q: z
    .string(ErrorCode.validationFailed)
    .trim()
    .max(120, ErrorCode.validationFailed)
    .optional(),
  /** Incluye las subcategorías. */
  categoryId: id.optional(),
  kind: z
    .enum(productKindSchema.options, ErrorCode.validationFailed)
    .optional(),
  /** Solo productos con alguna variante activa en o debajo de su punto de reposición. */
  lowStock: flag.optional(),
  /** Incluye los productos archivados (por defecto no aparecen). */
  includeArchived: flag.optional(),
  page: z.coerce.number(ErrorCode.validationFailed).int().min(1).default(1),
  pageSize: z.coerce
    .number(ErrorCode.validationFailed)
    .int()
    .min(1)
    .max(100)
    .default(25),
});

export type ProductListQuery = z.input<typeof productListQuerySchema>;

/** Todas las combinaciones de las opciones, en el orden de las opciones y sus valores. */
export function combinationsOf(options: ProductOptions): OptionValues[] {
  return options.reduce<OptionValues[]>(
    (combos, option) =>
      combos.flatMap((combo) =>
        option.values.map((value) => ({ ...combo, [option.name]: value })),
      ),
    [{}],
  );
}

/** Nombre de una variante a partir de sus valores: "EN · NM". */
export function variantNameOf(options: ProductOptions, values: OptionValues) {
  return options.map((option) => values[option.name]).join(" · ");
}
