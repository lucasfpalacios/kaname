"use client";

import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FormField,
  IconButton,
  Input,
  Label,
  MoneyInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Switch,
  TagInput,
  Textarea,
} from "@kaname/ui";
import {
  type CategorySummary,
  combinationsOf,
  createProductSchema,
  type Currency,
  ErrorCode,
  newVariantSchema,
  type OptionValues,
  optionValuesSchema,
  type ProductCombination,
  type ProductDetail,
  productKindSchema,
  productOptionsSchema,
  variantNameOf,
} from "@kaname/shared";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useId, useState } from "react";
import { Controller, useFieldArray, type Path } from "react-hook-form";
import { z } from "zod";
import { DialogContent } from "@/components/overlays";
import { useErrorMessage } from "@/components/use-error-message";
import { applyApiError, useZodForm } from "@/components/use-zod-form";
import type { ApiError } from "@/lib/api/errors";
import {
  catalogKeys,
  createCategory,
  createProduct,
  generateVariants,
  getCombinations,
  getProduct,
  updateProduct,
} from "@/lib/catalog/api";
import {
  categoryOptions,
  useCatalogFormat,
  useCategories,
  useRefreshCatalog,
} from "./use-catalog";

const MAX_OPTIONS = 3;
/** Valor del select de categoría para "sin categoría" (Radix no acepta ""). */
const NONE = "__none";

/** Clave estable de una combinación, sin importar el orden de las claves del objeto. */
const comboKey = (values: OptionValues) =>
  Object.entries(values)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([option, value]) => `${option}=${value}`)
    .join("|");

/** Cantidades: vacío es "sin dato" y la coma decimal se acepta. */
const optionalStock = (value: string) =>
  value.trim() === "" ? undefined : value.trim().replace(",", ".");
const optionalReorder = (value: string) =>
  value.trim() === "" ? null : value.trim().replace(",", ".");

const comboSchema = newVariantSchema.extend({
  key: z.string(),
  name: z.string(),
  optionValues: optionValuesSchema,
  selected: z.boolean(),
  /** Ya existe una variante con esta combinación (edición): no se vuelve a crear. */
  existing: z.boolean(),
});

// El formulario arma lo que espera la API (createProductSchema / updateProductSchema) con los
// mismos schemas de @kaname/shared para cada pieza. Las opciones se validan solo si el producto
// tiene variantes.
const productFormSchema = z
  .object({
    name: createProductSchema.shape.name,
    kind: productKindSchema,
    categoryId: z.string().nullable(),
    description: z.string().max(2000, ErrorCode.validationFailed),
    hasVariants: z.boolean(),
    options: z.array(
      z.object({ name: z.string(), values: z.array(z.string()) }),
    ),
    variant: newVariantSchema,
    combinations: z.array(comboSchema),
  })
  .superRefine((value, ctx) => {
    if (!value.hasVariants) return;
    if (
      value.options.length === 0 ||
      !productOptionsSchema.safeParse(value.options).success
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["options"],
        message: ErrorCode.optionsInvalid,
      });
    } else if (
      !value.combinations.some((combo) => combo.selected || combo.existing)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["combinations"],
        message: ErrorCode.combinationRequired,
      });
    }
  });

type FormInput = z.input<typeof productFormSchema>;
type FormOutput = z.output<typeof productFormSchema>;
type Combo = z.input<typeof comboSchema>;

// Alta y edición de un producto en un diálogo. Datos generales, categoría (se puede crear una en
// el momento), tipo y variantes: sin opciones, el SKU, costo y stock inicial de la única variante;
// con opciones (Idioma: EN, ES · Estado: NM, LP), las combinaciones para tildar cuáles crear, cada
// una con SKU, costo y stock inicial. En la edición, las combinaciones que ya existen quedan
// marcadas y las nuevas se crean al guardar; la variante existente se edita desde el detalle.
export function ProductFormDialog({
  workspaceId,
  baseCurrency,
  productId,
  onClose,
  onSaved,
}: {
  workspaceId: string;
  baseCurrency: Currency;
  productId: string | null;
  onClose: () => void;
  onSaved: (productId: string) => void;
}) {
  const t = useTranslations("Products");
  const product = useQuery({
    queryKey: catalogKeys.product(workspaceId, productId ?? ""),
    queryFn: () => getProduct(workspaceId, productId!),
    enabled: productId !== null,
  });
  const combinations = useQuery({
    queryKey: [...catalogKeys.product(workspaceId, productId ?? ""), "combos"],
    queryFn: () => getCombinations(workspaceId, productId!),
    enabled: productId !== null,
    // La edición siempre parte de lo que hay ahora.
    staleTime: 0,
  });
  const loading =
    productId !== null && (product.isPending || combinations.isPending);
  const failed =
    productId !== null && (product.isError || combinations.isError);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {productId
              ? t("form.editTitle", { name: product.data?.name ?? "" })
              : t("form.newTitle")}
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : failed ? (
          <Alert variant="destructive">{t("loadError")}</Alert>
        ) : (
          <ProductForm
            workspaceId={workspaceId}
            baseCurrency={baseCurrency}
            product={product.data ?? null}
            combinations={combinations.data ?? []}
            onSaved={onSaved}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function initialValues(
  baseCurrency: Currency,
  product: ProductDetail | null,
  combinations: ProductCombination[],
): FormInput {
  const emptyVariant = { sku: "", costCurrency: baseCurrency };
  if (!product) {
    return {
      name: "",
      kind: "FINISHED",
      categoryId: null,
      description: "",
      hasVariants: false,
      options: [],
      variant: emptyVariant,
      combinations: [],
    };
  }
  return {
    name: product.name,
    kind: product.kind,
    categoryId: product.category?.id ?? null,
    description: product.description ?? "",
    hasVariants: product.options.length > 0,
    options: product.options,
    variant: emptyVariant,
    combinations: combinations.map((combo) => ({
      ...emptyVariant,
      key: comboKey(combo.optionValues),
      name: combo.name,
      optionValues: combo.optionValues,
      selected: combo.variantId !== null,
      existing: combo.variantId !== null,
    })),
  };
}

function ProductForm({
  workspaceId,
  baseCurrency,
  product,
  combinations: serverCombinations,
  onSaved,
}: {
  workspaceId: string;
  baseCurrency: Currency;
  product: ProductDetail | null;
  combinations: ProductCombination[];
  onSaved: (productId: string) => void;
}) {
  const t = useTranslations("Products");
  const tCommon = useTranslations("Common");
  const id = useId();
  const format = useCatalogFormat();
  const refresh = useRefreshCatalog(workspaceId);
  const categories = useCategories(workspaceId);
  const { form, fieldError, formError } = useZodForm(
    productFormSchema,
    initialValues(baseCurrency, product, serverCombinations),
  );
  const options = useFieldArray({ control: form.control, name: "options" });
  const combos = useFieldArray({
    control: form.control,
    name: "combinations",
    keyName: "fieldKey",
  });
  const hasVariants = form.watch("hasVariants");
  const watchedOptions = form.watch("options");
  const isEdit = product !== null;
  const existingKeys = new Set(
    serverCombinations
      .filter((combo) => combo.variantId !== null)
      .map((combo) => comboKey(combo.optionValues)),
  );

  // Las combinaciones siguen a las opciones: las que ya estaban conservan lo cargado.
  const optionsKey = JSON.stringify(watchedOptions);
  useEffect(() => {
    const parsed = productOptionsSchema.safeParse(watchedOptions);
    const valid = parsed.success
      ? parsed.data.filter((option) => option.values.length > 0)
      : [];
    const current = new Map(
      form.getValues("combinations").map((combo) => [combo.key, combo]),
    );
    const next: Combo[] =
      valid.length === 0
        ? []
        : combinationsOf(valid).map((values) => {
            const key = comboKey(values);
            const previous = current.get(key);
            const existing = existingKeys.has(key);
            return {
              sku: "",
              costCurrency: baseCurrency,
              ...previous,
              key,
              name: variantNameOf(valid, values),
              optionValues: values,
              existing,
              // Las nuevas arrancan tildadas.
              selected: existing || (previous?.selected ?? true),
            };
          });
    const same =
      next.length === current.size &&
      next.every((combo) => current.get(combo.key)?.name === combo.name);
    if (!same) combos.replace(next);
    // Solo cuando cambian las opciones (optionsKey); el resto se lee en el momento.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionsKey]);

  // Campos con control en pantalla: lo demás va al error general.
  const fields: Path<FormInput>[] = [
    "name",
    "kind",
    "categoryId",
    "description",
    "options",
    "combinations",
    "variant.sku",
    "variant.costAmount",
    "variant.initialStock",
    "variant.reorderPoint",
    ...combos.fields.flatMap((_, index) => [
      `combinations.${index}.sku` as const,
      `combinations.${index}.costAmount` as const,
      `combinations.${index}.initialStock` as const,
    ]),
  ];

  /** Los issues de "combinations.N" se refieren a las enviadas: se pasan al índice del form. */
  function remapIssues(error: ApiError, sent: number[]): ApiError {
    return {
      ...error,
      issues: error.issues.map((issue) => {
        const match = /^combinations\.(\d+)\.(.+)$/.exec(issue.path);
        return match && sent[Number(match[1])] !== undefined
          ? {
              ...issue,
              path: `combinations.${sent[Number(match[1])]}.${match[2]}`,
            }
          : issue;
      }),
    };
  }

  const submit = form.handleSubmit(async (values: FormOutput) => {
    const sent = values.combinations
      .map((combo, index) => ({ combo, index }))
      .filter(({ combo }) => combo.selected && !combo.existing);
    // Lo que se carga por combinación en el formulario; el resto queda por defecto.
    const newCombinations = sent.map(({ combo }) => ({
      optionValues: combo.optionValues,
      sku: combo.sku,
      costAmount: combo.costAmount,
      costCurrency: combo.costCurrency,
      initialStock: combo.initialStock,
    }));
    const general = {
      name: values.name,
      kind: values.kind,
      categoryId: values.categoryId,
      description: values.description,
      options: values.hasVariants ? values.options : [],
    };
    const byCode = {
      sku_taken: "variant.sku" as const,
      options_in_use: "options" as const,
      options_invalid: "options" as const,
    };

    if (!isEdit) {
      const result = await createProduct(workspaceId, {
        ...general,
        variant: values.hasVariants ? undefined : values.variant,
        combinations: values.hasVariants ? newCombinations : undefined,
      });
      if (!result.ok) {
        applyApiError(
          form,
          remapIssues(
            result.error,
            sent.map(({ index }) => index),
          ),
          fields,
          values.hasVariants ? { ...byCode, sku_taken: undefined } : byCode,
        );
        return;
      }
      onSaved(result.data.id);
      return;
    }

    const updated = await updateProduct(workspaceId, product.id, general);
    if (!updated.ok) {
      applyApiError(form, updated.error, fields, byCode);
      return;
    }
    if (newCombinations.length > 0) {
      const generated = await generateVariants(workspaceId, product.id, {
        combinations: newCombinations,
      });
      if (!generated.ok) {
        // El producto ya se guardó: que se vea el cambio aunque falten las variantes.
        void refresh();
        applyApiError(
          form,
          remapIssues(
            generated.error,
            sent.map(({ index }) => index),
          ),
          fields,
        );
        return;
      }
    }
    onSaved(product.id);
  });

  const comboError = fieldError("combinations");
  const optionsError = fieldError("options");

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-6">
      {formError && <Alert variant="destructive">{formError}</Alert>}
      <section className="grid gap-5 sm:grid-cols-2">
        <FormField
          label={t("fields.name")}
          error={fieldError("name")}
          required
          className="sm:col-span-2"
        >
          <Input
            {...form.register("name")}
            maxLength={120}
            placeholder={t("fields.namePlaceholder")}
            autoFocus={!isEdit}
          />
        </FormField>
        <Controller
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <CategoryField
              workspaceId={workspaceId}
              value={field.value}
              onChange={field.onChange}
              fieldRef={field.ref}
              error={fieldError("categoryId")}
              categories={categories.data ?? []}
            />
          )}
        />
        <FormField label={t("fields.kind")} error={fieldError("kind")} required>
          <Controller
            control={form.control}
            name="kind"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger ref={field.ref}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {productKindSchema.options.map((kind) => (
                    <SelectItem key={kind} value={kind}>
                      {t(`kinds.${kind}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
        <FormField
          label={t("fields.description")}
          error={fieldError("description")}
          className="sm:col-span-2"
        >
          <Textarea
            {...form.register("description")}
            maxLength={2000}
            rows={2}
          />
        </FormField>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <Controller
            control={form.control}
            name="hasVariants"
            render={({ field }) => (
              <Switch
                id={`${id}-variants`}
                checked={field.value}
                onCheckedChange={field.onChange}
                // Con variantes creadas, sacar las opciones las dejaría sin sentido.
                disabled={isEdit && product.options.length > 0}
                aria-describedby={`${id}-variants-help`}
              />
            )}
          />
          <div className="flex flex-col gap-0.5">
            <Label htmlFor={`${id}-variants`}>{t("form.hasVariants")}</Label>
            <p
              id={`${id}-variants-help`}
              className="text-xs text-foreground/70"
            >
              {t("form.hasVariantsHelp")}
            </p>
          </div>
        </div>

        {!hasVariants && !isEdit && (
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              label={t("fields.sku")}
              error={fieldError("variant.sku")}
            >
              <Input
                {...form.register("variant.sku")}
                maxLength={64}
                spellCheck={false}
                autoComplete="off"
                className="font-mono"
              />
            </FormField>
            <Controller
              control={form.control}
              name="variant.costAmount"
              render={({ field }) => (
                <FormField
                  label={t("fields.cost")}
                  error={fieldError("variant.costAmount")}
                >
                  <MoneyInput
                    ref={field.ref}
                    value={field.value ?? null}
                    onValueChange={(value) =>
                      field.onChange(value ?? undefined)
                    }
                    currency={
                      form.watch("variant.costCurrency") ?? baseCurrency
                    }
                    onCurrencyChange={(currency) =>
                      form.setValue("variant.costCurrency", currency)
                    }
                    currencyLabel={t("fields.currency")}
                    locale={format.locale}
                  />
                </FormField>
              )}
            />
            <FormField
              label={t("fields.initialStock")}
              error={fieldError("variant.initialStock")}
            >
              <Input
                {...form.register("variant.initialStock", {
                  setValueAs: optionalStock,
                })}
                inputMode="decimal"
                autoComplete="off"
              />
            </FormField>
            <FormField
              label={t("fields.reorderPoint")}
              description={t("fields.reorderPointHelp")}
              error={fieldError("variant.reorderPoint")}
            >
              <Input
                {...form.register("variant.reorderPoint", {
                  setValueAs: optionalReorder,
                })}
                inputMode="decimal"
                autoComplete="off"
              />
            </FormField>
          </div>
        )}
        {!hasVariants && isEdit && (
          <p className="text-sm text-foreground/70">
            {t("form.editVariantHint")}
          </p>
        )}

        {hasVariants && (
          <>
            <fieldset className="flex flex-col gap-3">
              <legend className="mb-2 text-sm font-medium">
                {t("form.options")}
              </legend>
              {options.fields.map((option, index) => (
                <div
                  key={option.id}
                  // En mobile: nombre y botón de quitar arriba, valores abajo.
                  className="grid grid-cols-[1fr_auto] items-start gap-2 sm:grid-cols-[12rem_1fr_auto]"
                >
                  <Input
                    {...form.register(`options.${index}.name`)}
                    aria-label={t("form.optionName", { index: index + 1 })}
                    placeholder={t("form.optionNamePlaceholder")}
                    maxLength={40}
                  />
                  <Controller
                    control={form.control}
                    name={`options.${index}.values`}
                    render={({ field }) => (
                      <TagInput
                        value={field.value}
                        onChange={field.onChange}
                        aria-label={t("form.optionValues", {
                          index: index + 1,
                        })}
                        removeLabel={(tag) =>
                          t("form.removeValue", { value: tag })
                        }
                        placeholder={t("form.optionValuesPlaceholder")}
                        max={50}
                        className="order-3 col-span-2 sm:order-none sm:col-span-1"
                      />
                    )}
                  />
                  <IconButton
                    type="button"
                    className="order-2 sm:order-none"
                    label={t("form.removeOption", { index: index + 1 })}
                    onClick={() => options.remove(index)}
                  >
                    <Trash2 />
                  </IconButton>
                </div>
              ))}
              {optionsError && (
                <p className="text-sm text-destructive">{optionsError}</p>
              )}
              {options.fields.length < MAX_OPTIONS && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="self-start"
                  onClick={() => options.append({ name: "", values: [] })}
                >
                  <Plus />
                  {t("form.addOption")}
                </Button>
              )}
            </fieldset>

            {combos.fields.length > 0 && (
              <fieldset className="flex flex-col gap-2">
                <legend className="mb-2 text-sm font-medium">
                  {t("form.combinations", { count: combos.fields.length })}
                </legend>
                <p className="text-xs text-foreground/70">
                  {t("form.combinationsHelp")}
                </p>
                <ul className="flex flex-col divide-y divide-border rounded-md border border-border">
                  {combos.fields.map((combo, index) => (
                    <CombinationRow
                      key={combo.fieldKey}
                      index={index}
                      combo={combo}
                      form={form}
                      fieldError={fieldError}
                      baseCurrency={baseCurrency}
                      locale={format.locale}
                    />
                  ))}
                </ul>
                {comboError && (
                  <p className="text-sm text-destructive">{comboError}</p>
                )}
              </fieldset>
            )}
          </>
        )}
      </section>

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            {tCommon("cancel")}
          </Button>
        </DialogClose>
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          aria-busy={form.formState.isSubmitting || undefined}
        >
          {isEdit ? t("save") : t("form.create")}
        </Button>
      </DialogFooter>
    </form>
  );
}

type FormApi = ReturnType<typeof useZodForm<typeof productFormSchema>>;

function CombinationRow({
  index,
  combo,
  form: formApi,
  fieldError,
  baseCurrency,
  locale,
}: {
  index: number;
  combo: Combo;
  form: FormApi["form"];
  fieldError: FormApi["fieldError"];
  baseCurrency: Currency;
  locale: string;
}) {
  const t = useTranslations("Products");
  const id = useId();
  const form = formApi;
  const selected = form.watch(`combinations.${index}.selected`);
  const disabled = combo.existing || !selected;
  const errors = [
    fieldError(`combinations.${index}.sku`),
    fieldError(`combinations.${index}.costAmount`),
    fieldError(`combinations.${index}.initialStock`),
  ].filter(Boolean);

  return (
    <li className="flex flex-col gap-2 p-3">
      <div className="grid items-center gap-2 sm:grid-cols-[minmax(7rem,1fr)_13rem_11rem_5rem]">
        <div className="flex items-center gap-2">
          <Controller
            control={form.control}
            name={`combinations.${index}.selected`}
            render={({ field }) => (
              <Checkbox
                id={`${id}-selected`}
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                disabled={combo.existing}
              />
            )}
          />
          <Label htmlFor={`${id}-selected`} className="font-medium">
            {combo.name}
          </Label>
          {combo.existing && (
            <span className="text-xs text-foreground/70">
              {t("form.existing")}
            </span>
          )}
        </div>
        {!combo.existing && (
          <>
            <Input
              {...form.register(`combinations.${index}.sku`)}
              aria-label={t("form.comboSku", { name: combo.name })}
              placeholder={t("fields.sku")}
              maxLength={64}
              spellCheck={false}
              autoComplete="off"
              disabled={disabled}
              className="font-mono"
            />
            <Controller
              control={form.control}
              name={`combinations.${index}.costAmount`}
              render={({ field }) => (
                <MoneyInput
                  ref={field.ref}
                  aria-label={t("form.comboCost", { name: combo.name })}
                  value={field.value ?? null}
                  onValueChange={(value) => field.onChange(value ?? undefined)}
                  currency={
                    form.watch(`combinations.${index}.costCurrency`) ??
                    baseCurrency
                  }
                  onCurrencyChange={(currency) =>
                    form.setValue(
                      `combinations.${index}.costCurrency`,
                      currency,
                    )
                  }
                  currencyLabel={t("fields.currency")}
                  locale={locale}
                  disabled={disabled}
                />
              )}
            />
            <Input
              {...form.register(`combinations.${index}.initialStock`, {
                setValueAs: optionalStock,
              })}
              aria-label={t("form.comboStock", { name: combo.name })}
              placeholder={t("form.stockPlaceholder")}
              inputMode="decimal"
              autoComplete="off"
              disabled={disabled}
            />
          </>
        )}
      </div>
      {errors.length > 0 && (
        <p className="text-sm text-destructive">{errors.join(" ")}</p>
      )}
    </li>
  );
}

// Select de categoría con la opción de crear una nueva sin salir del formulario.
function CategoryField({
  workspaceId,
  value,
  onChange,
  fieldRef,
  error,
  categories,
}: {
  workspaceId: string;
  value: string | null;
  onChange: (value: string | null) => void;
  fieldRef: (element: HTMLButtonElement | null) => void;
  error?: string;
  categories: CategorySummary[];
}) {
  const t = useTranslations("Products");
  const errorMessage = useErrorMessage();
  const refresh = useRefreshCatalog(workspaceId);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function create() {
    setBusy(true);
    setCreateError(null);
    const result = await createCategory(workspaceId, {
      name,
      parentId: null,
    });
    setBusy(false);
    if (!result.ok) {
      setCreateError(
        errorMessage(result.error.issues[0]?.code ?? result.error.code),
      );
      return;
    }
    await refresh();
    onChange(result.data.id);
    setName("");
    setCreating(false);
  }

  if (creating) {
    return (
      <FormField
        label={t("fields.newCategory")}
        error={createError ?? undefined}
      >
        <div className="flex gap-2">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              // Enter crea la categoría, no envía el producto.
              if (event.key === "Enter") {
                event.preventDefault();
                void create();
              }
            }}
            maxLength={120}
            autoFocus
          />
          <Button
            type="button"
            size="md"
            disabled={busy || name.trim() === ""}
            aria-busy={busy || undefined}
            onClick={() => void create()}
          >
            {t("form.createCategory")}
          </Button>
          <IconButton
            type="button"
            label={t("form.cancelCategory")}
            onClick={() => {
              setCreating(false);
              setCreateError(null);
            }}
          >
            <X />
          </IconButton>
        </div>
      </FormField>
    );
  }

  return (
    <FormField label={t("columns.category")} error={error}>
      <div className="flex gap-2">
        <Select
          value={value ?? NONE}
          onValueChange={(next) => onChange(next === NONE ? null : next)}
        >
          <SelectTrigger ref={fieldRef} className="min-w-0 flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>{t("fields.noCategory")}</SelectItem>
            {categoryOptions(categories).map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <IconButton
          type="button"
          label={t("fields.newCategory")}
          onClick={() => setCreating(true)}
        >
          <Plus />
        </IconButton>
      </div>
    </FormField>
  );
}
