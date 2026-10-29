import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  combinationsOf,
  type createProductSchema,
  ErrorCode,
  type generateVariantsSchema,
  type newVariantSchema,
  type OptionValues,
  type productListQuerySchema,
  type ProductListPage,
  type ProductOptions,
  type stockAdjustmentSchema,
  type updateProductSchema,
  type updateVariantSchema,
  variantNameOf,
  type VariantView,
} from "@kaname/shared";
import type { z } from "zod";
import { uniqueIndexOf } from "../common/prisma-errors.js";
import {
  Prisma,
  type ProductKind,
  type ProductVariant,
  StockMovementType,
} from "../generated/prisma/client.js";
import { PrismaService } from "../prisma/prisma.service.js";

type Tx = Prisma.TransactionClient;
type NewVariant = z.output<typeof newVariantSchema>;

const SKU_INDEX = "ProductVariant_workspaceId_sku_key";

const isLow = (variant: ProductVariant) =>
  variant.isActive &&
  variant.trackStock &&
  variant.reorderPoint !== null &&
  variant.stock.lte(variant.reorderPoint);

export const toVariantView = (variant: ProductVariant): VariantView => ({
  id: variant.id,
  name: variant.name,
  sku: variant.sku,
  barcode: variant.barcode,
  optionValues: variant.optionValues as OptionValues,
  costAmount: variant.costAmount.toFixed(2),
  costCurrency: variant.costCurrency,
  stock: variant.stock.toFixed(3),
  unit: variant.unit,
  reorderPoint: variant.reorderPoint?.toFixed(3) ?? null,
  trackStock: variant.trackStock,
  defaultSupplierId: variant.defaultSupplierId,
  isDefault: variant.isDefault,
  isActive: variant.isActive,
  lowStock: isLow(variant),
});

const sameCombination = (a: OptionValues, b: OptionValues) =>
  Object.keys(a).length === Object.keys(b).length &&
  Object.entries(a).every(([key, value]) => b[key] === value);

/** La combinación tiene exactamente una opción de cada una y valores que existen. */
const fitsOptions = (options: ProductOptions, values: OptionValues) =>
  Object.keys(values).length === options.length &&
  options.every((option) => option.values.includes(values[option.name] ?? ""));

// Catálogo de un espacio: productos, sus variantes (donde viven stock, costo y SKU) y los ajustes
// de stock. Todo se busca con el workspaceId que validó el guard, y toda FK que entra (categoría,
// proveedor) se valida contra el mismo espacio antes de guardar.
@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  // --- Productos ---

  /** Listado paginado con búsqueda y filtros (todo en la base, listo para catálogos grandes). */
  async list(
    workspaceId: string,
    query: z.output<typeof productListQuerySchema>,
  ): Promise<ProductListPage> {
    const where: Prisma.ProductWhereInput = { workspaceId };
    const and: Prisma.ProductWhereInput[] = [];
    if (query.q) {
      const contains = { contains: query.q, mode: "insensitive" as const };
      and.push({
        OR: [
          { name: contains },
          {
            variants: {
              some: { OR: [{ sku: contains }, { barcode: contains }] },
            },
          },
        ],
      });
    }
    if (query.categoryId) {
      // La categoría y sus subcategorías.
      and.push({
        OR: [
          { categoryId: query.categoryId },
          { category: { parentId: query.categoryId } },
        ],
      });
    }
    if (query.kind) where.kind = query.kind;
    if (!query.includeArchived) where.isActive = true;
    if (query.lowStock) {
      and.push({
        variants: {
          some: {
            isActive: true,
            trackStock: true,
            reorderPoint: { not: null },
            stock: { lte: this.prisma.productVariant.fields.reorderPoint },
          },
        },
      });
    }
    if (and.length > 0) where.AND = and;

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true } },
          variants: {
            include: { defaultSupplier: { select: { name: true } } },
            orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
          },
        },
        orderBy: [{ name: "asc" }, { id: "asc" }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
    ]);

    return {
      items: rows.map((product) => ({
        id: product.id,
        name: product.name,
        kind: product.kind,
        isActive: product.isActive,
        category: product.category,
        variantCount: product.variants.length,
        // Con una sola variante, su SKU; con varias, cada una tiene el suyo.
        sku: product.variants.length === 1 ? product.variants[0].sku : null,
        // El menor costo de las variantes y si alguna tiene otro (para mostrar "desde").
        cost: costSummary(product.variants),
        supplier:
          product.variants.find((variant) => variant.defaultSupplier)
            ?.defaultSupplier?.name ?? null,
        // Suma del stock de las variantes que lo controlan.
        totalStock: product.variants
          .filter((variant) => variant.trackStock)
          .reduce(
            (sum, variant) => sum.add(variant.stock),
            new Prisma.Decimal(0),
          )
          .toFixed(3),
        lowStock: product.variants.some(isLow),
      })),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async get(workspaceId: string, productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, workspaceId },
      include: {
        category: { select: { id: true, name: true } },
        variants: { orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] },
      },
    });
    if (!product) throw new NotFoundException(ErrorCode.notFound);
    return {
      id: product.id,
      name: product.name,
      kind: product.kind,
      description: product.description,
      options: product.options as ProductOptions,
      isActive: product.isActive,
      category: product.category,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      variants: product.variants.map(toVariantView),
    };
  }

  /**
   * Crea el producto con al menos una variante: sin opciones, la "default" (con los datos de
   * `variant`); con opciones, las combinaciones elegidas. El stock inicial entra como ajuste.
   */
  async create(
    workspaceId: string,
    input: z.output<typeof createProductSchema>,
  ) {
    await this.assertCategory(workspaceId, input.categoryId);
    const variants: { data: NewVariant; values: OptionValues }[] =
      input.options.length === 0
        ? [{ data: input.variant ?? {}, values: {} }]
        : this.checkCombinations(input.options, input.combinations ?? [], []);
    if (input.options.length === 0 && input.combinations?.length) {
      throw new BadRequestException(ErrorCode.combinationInvalid);
    }
    await this.assertSuppliers(
      workspaceId,
      variants.map((variant) => variant.data.defaultSupplierId),
    );

    const productId = await this.withSkuCheck(() =>
      this.prisma.$transaction(async (tx) => {
        const product = await tx.product.create({
          data: {
            workspaceId,
            name: input.name,
            kind: input.kind,
            categoryId: input.categoryId,
            description: input.description,
            options: input.options,
          },
        });
        for (const variant of variants) {
          await this.createVariant(
            tx,
            workspaceId,
            product,
            variant.data,
            variant.values,
          );
        }
        return product.id;
      }),
    );
    return this.get(workspaceId, productId);
  }

  async update(
    workspaceId: string,
    productId: string,
    input: z.output<typeof updateProductSchema>,
  ) {
    const product = await this.findProduct(workspaceId, productId);
    if (input.categoryId !== undefined) {
      await this.assertCategory(workspaceId, input.categoryId);
    }
    await this.prisma.$transaction(async (tx) => {
      if (input.options !== undefined) {
        await this.applyOptions(tx, product.id, input.options);
      }
      await tx.product.update({
        where: { id: product.id },
        data: {
          name: input.name,
          kind: input.kind,
          categoryId: input.categoryId,
          description: input.description,
          options: input.options,
        },
      });
    });
    return this.get(workspaceId, product.id);
  }

  /**
   * Borra el producto con sus variantes. Si alguna tiene historial (movimientos de stock además
   * del inicial), 409 has_history: se archiva en vez de borrarse.
   */
  async remove(workspaceId: string, productId: string): Promise<void> {
    const product = await this.findProduct(workspaceId, productId);
    await this.prisma.$transaction(async (tx) => {
      await this.assertNoHistory(tx, workspaceId, { productId: product.id });
      await tx.product.delete({ where: { id: product.id } });
    });
  }

  /** Archiva o restaura el producto (isActive). Los archivados no aparecen en el listado. */
  async setProductActive(
    workspaceId: string,
    productId: string,
    isActive: boolean,
  ) {
    const product = await this.findProduct(workspaceId, productId);
    await this.prisma.product.update({
      where: { id: product.id },
      data: { isActive },
    });
    return this.get(workspaceId, product.id);
  }

  // --- Variantes ---

  /** Todas las combinaciones de las opciones, con la variante que ya existe para cada una. */
  async combinations(workspaceId: string, productId: string) {
    const product = await this.findProduct(workspaceId, productId);
    const options = product.options as ProductOptions;
    const variants = await this.prisma.productVariant.findMany({
      where: { productId: product.id, workspaceId },
    });
    return combinationsOf(options).map((values) => {
      const existing = variants.find((variant) =>
        sameCombination(variant.optionValues as OptionValues, values),
      );
      return {
        optionValues: values,
        name: variantNameOf(options, values),
        variantId: existing?.id ?? null,
      };
    });
  }

  /** Crea las combinaciones elegidas que todavía no existen. */
  async generateVariants(
    workspaceId: string,
    productId: string,
    input: z.output<typeof generateVariantsSchema>,
  ) {
    const product = await this.findProduct(workspaceId, productId);
    const options = product.options as ProductOptions;
    if (options.length === 0) {
      throw new BadRequestException(ErrorCode.combinationInvalid);
    }
    const existing = await this.prisma.productVariant.findMany({
      where: { productId: product.id, workspaceId },
      select: { optionValues: true },
    });
    const variants = this.checkCombinations(
      options,
      input.combinations,
      existing.map((variant) => variant.optionValues as OptionValues),
    );
    await this.assertSuppliers(
      workspaceId,
      variants.map((variant) => variant.data.defaultSupplierId),
    );
    await this.withSkuCheck(() =>
      this.prisma.$transaction(async (tx) => {
        for (const variant of variants) {
          await this.createVariant(
            tx,
            workspaceId,
            product,
            variant.data,
            variant.values,
          );
        }
      }),
    );
    return this.get(workspaceId, product.id);
  }

  async updateVariant(
    workspaceId: string,
    variantId: string,
    input: z.output<typeof updateVariantSchema>,
  ): Promise<VariantView> {
    const variant = await this.findVariant(workspaceId, variantId);
    await this.assertSuppliers(workspaceId, [input.defaultSupplierId]);
    const updated = await this.withSkuCheck(() =>
      this.prisma.productVariant.update({
        where: { id: variant.id },
        data: input,
      }),
    );
    return toVariantView(updated);
  }

  /**
   * Borra una variante. Con historial, 409 has_history (se archiva). La última de un producto
   * tampoco: el producto siempre tiene una.
   */
  async removeVariant(workspaceId: string, variantId: string): Promise<void> {
    const variant = await this.findVariant(workspaceId, variantId);
    await this.prisma.$transaction(async (tx) => {
      await this.assertNoHistory(tx, workspaceId, { id: variant.id });
      const siblings = await tx.productVariant.count({
        where: { productId: variant.productId, workspaceId },
      });
      if (siblings <= 1) throw new ConflictException(ErrorCode.lastVariant);
      await tx.productVariant.delete({ where: { id: variant.id } });
    });
  }

  /** Archiva o restaura una variante (isActive). */
  async setVariantActive(
    workspaceId: string,
    variantId: string,
    isActive: boolean,
  ): Promise<VariantView> {
    const variant = await this.findVariant(workspaceId, variantId);
    const updated = await this.prisma.productVariant.update({
      where: { id: variant.id },
      data: { isActive },
    });
    return toVariantView(updated);
  }

  // --- Stock ---

  /**
   * Ajuste de stock: crea el movimiento y actualiza el stock en una transacción. El stock nunca
   * queda negativo: la condición va en el mismo UPDATE, así dos ajustes simultáneos no lo pasan.
   */
  async adjustStock(
    workspaceId: string,
    variantId: string,
    input: z.output<typeof stockAdjustmentSchema>,
  ) {
    const variant = await this.findVariant(workspaceId, variantId);
    if (!variant.trackStock) {
      throw new ConflictException(ErrorCode.stockNotTracked);
    }
    const quantity = new Prisma.Decimal(input.quantity);
    return this.prisma.$transaction(async (tx) => {
      const { count } = await tx.productVariant.updateMany({
        where: {
          id: variant.id,
          workspaceId,
          ...(quantity.isNegative()
            ? { stock: { gte: quantity.negated() } }
            : {}),
        },
        data: { stock: { increment: quantity } },
      });
      if (count === 0) throw new ConflictException(ErrorCode.stockNegative);
      const movement = await tx.stockMovement.create({
        data: {
          workspaceId,
          variantId: variant.id,
          type: StockMovementType.ADJUSTMENT,
          quantity,
          note: input.note ?? null,
        },
      });
      const updated = await tx.productVariant.findUniqueOrThrow({
        where: { id: variant.id },
      });
      return {
        variant: toVariantView(updated),
        movement: toMovementView(movement),
      };
    });
  }

  /** Los últimos movimientos de una variante, del más nuevo al más viejo. */
  async movements(workspaceId: string, variantId: string) {
    const variant = await this.findVariant(workspaceId, variantId);
    const rows = await this.prisma.stockMovement.findMany({
      where: { variantId: variant.id, workspaceId },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 100,
    });
    return rows.map(toMovementView);
  }

  // --- Ayudas ---

  /**
   * Historial de las variantes elegidas: movimientos de stock que no son el inicial. Cuando haya
   * pedidos, compras y presupuestos (Fase 4), también cuentan sus ítems.
   */
  private async assertNoHistory(
    tx: Tx,
    workspaceId: string,
    variants: Prisma.ProductVariantWhereInput,
  ) {
    const history = await tx.stockMovement.count({
      where: {
        workspaceId,
        initial: false,
        variant: { ...variants, workspaceId },
      },
    });
    if (history > 0) throw new ConflictException(ErrorCode.hasHistory);
  }

  private async findProduct(workspaceId: string, productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, workspaceId },
    });
    if (!product) throw new NotFoundException(ErrorCode.notFound);
    return product;
  }

  private async findVariant(workspaceId: string, variantId: string) {
    const variant = await this.prisma.productVariant.findFirst({
      where: { id: variantId, workspaceId },
    });
    if (!variant) throw new NotFoundException(ErrorCode.notFound);
    return variant;
  }

  /** Crea una variante y, si trae stock inicial, su ajuste. */
  private async createVariant(
    tx: Tx,
    workspaceId: string,
    product: { id: string; kind: ProductKind; options: Prisma.JsonValue },
    data: NewVariant,
    values: OptionValues,
  ) {
    const { initialStock, ...fields } = data;
    const isDefault = Object.keys(values).length === 0;
    // Un servicio no tiene stock salvo que se pida.
    const trackStock = fields.trackStock ?? product.kind !== "SERVICE";
    const stock = new Prisma.Decimal(initialStock ?? 0);
    if (!trackStock && !stock.isZero()) {
      throw new ConflictException(ErrorCode.stockNotTracked);
    }
    const variant = await tx.productVariant.create({
      data: {
        ...fields,
        workspaceId,
        productId: product.id,
        isDefault,
        optionValues: values,
        name: isDefault
          ? null
          : variantNameOf(product.options as ProductOptions, values),
        trackStock,
        stock,
      },
    });
    if (!stock.isZero()) {
      await tx.stockMovement.create({
        data: {
          workspaceId,
          variantId: variant.id,
          type: StockMovementType.ADJUSTMENT,
          quantity: stock,
          note: "Stock inicial",
          initial: true,
        },
      });
    }
  }

  /**
   * Valida combinaciones contra las opciones: cada una con todas las opciones y valores que
   * existen, sin repetirse entre sí ni con las variantes que ya hay.
   */
  private checkCombinations(
    options: ProductOptions,
    combinations: z.output<typeof generateVariantsSchema>["combinations"],
    existing: OptionValues[],
  ) {
    if (combinations.length === 0) {
      throw new BadRequestException(ErrorCode.combinationRequired);
    }
    const seen: OptionValues[] = [...existing];
    return combinations.map(({ optionValues, ...data }) => {
      if (!fitsOptions(options, optionValues)) {
        throw new BadRequestException(ErrorCode.combinationInvalid);
      }
      if (seen.some((values) => sameCombination(values, optionValues))) {
        throw new ConflictException(ErrorCode.combinationExists);
      }
      seen.push(optionValues);
      return { data, values: optionValues };
    });
  }

  /**
   * Cambia las opciones de un producto. Las variantes que ya tienen combinación tienen que
   * seguir siendo válidas (si no, 409); sus nombres se actualizan con el orden nuevo.
   */
  private async applyOptions(
    tx: Tx,
    productId: string,
    options: ProductOptions,
  ) {
    const variants = await tx.productVariant.findMany({ where: { productId } });
    for (const variant of variants) {
      const values = variant.optionValues as OptionValues;
      if (Object.keys(values).length === 0) continue;
      if (!fitsOptions(options, values)) {
        throw new ConflictException(ErrorCode.optionsInUse);
      }
      await tx.productVariant.update({
        where: { id: variant.id },
        data: { name: variantNameOf(options, values) },
      });
    }
  }

  // La categoría tiene que ser del mismo espacio. Una de otro espacio o inexistente: el mismo
  // error, sin revelar que existe.
  private async assertCategory(workspaceId: string, categoryId: string | null) {
    if (categoryId === null) return;
    const found = await this.prisma.category.count({
      where: { id: categoryId, workspaceId },
    });
    if (found === 0) throw new BadRequestException(ErrorCode.categoryInvalid);
  }

  private async assertSuppliers(
    workspaceId: string,
    ids: (string | null | undefined)[],
  ) {
    const unique = [...new Set(ids.filter((id): id is string => Boolean(id)))];
    if (unique.length === 0) return;
    const found = await this.prisma.supplier.count({
      where: { id: { in: unique }, workspaceId },
    });
    if (found !== unique.length) {
      throw new BadRequestException(ErrorCode.supplierInvalid);
    }
  }

  /** Un SKU repetido en el espacio (también dentro del mismo pedido) es 409 sku_taken. */
  private async withSkuCheck<T>(run: () => Promise<T>): Promise<T> {
    try {
      return await run();
    } catch (error) {
      if (uniqueIndexOf(error) === SKU_INDEX) {
        throw new ConflictException(ErrorCode.skuTaken);
      }
      throw error;
    }
  }
}

/**
 * El menor costo de las variantes en la moneda de la primera (el "desde" del listado) y si alguna
 * tiene otro costo u otra moneda.
 */
function costSummary(variants: ProductVariant[]) {
  const [first] = variants;
  if (!first) return null;
  const lowest = variants
    .filter((variant) => variant.costCurrency === first.costCurrency)
    .reduce((min, variant) =>
      variant.costAmount.lessThan(min.costAmount) ? variant : min,
    );
  return {
    amount: lowest.costAmount.toFixed(2),
    currency: first.costCurrency,
    varies: variants.some(
      (variant) =>
        variant.costCurrency !== first.costCurrency ||
        !variant.costAmount.equals(first.costAmount),
    ),
  };
}

const toMovementView = (movement: {
  id: string;
  type: StockMovementType;
  quantity: Prisma.Decimal;
  note: string | null;
  createdAt: Date;
}) => ({
  id: movement.id,
  type: movement.type,
  quantity: movement.quantity.toFixed(3),
  note: movement.note,
  createdAt: movement.createdAt,
});
