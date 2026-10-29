"use client";

import {
  Alert,
  Button,
  Dialog,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FormField,
  Input,
  MoneyInput,
  toast,
} from "@kaname/ui";
import { updateVariantSchema, type VariantView } from "@kaname/shared";
import { useTranslations } from "next-intl";
import { Controller } from "react-hook-form";
import { DialogContent } from "@/components/overlays";
import { applyApiError, useZodForm } from "@/components/use-zod-form";
import { updateVariant } from "@/lib/catalog/api";
import { useCatalogFormat, useRefreshCatalog } from "./use-catalog";

/** Vacío es null (sin punto de reposición); la coma decimal se acepta. */
const optionalQuantity = (value: string) =>
  value.trim() === "" ? null : value.trim().replace(",", ".");

// Edición de una variante: SKU, código de barras, costo y punto de reposición. El stock no se
// edita acá: cambia con ajustes (y más adelante con compras y ventas).
export function VariantFormDialog({
  workspaceId,
  productName,
  variant,
  onClose,
}: {
  workspaceId: string;
  productName: string;
  variant: VariantView;
  onClose: () => void;
}) {
  const t = useTranslations("Products");
  const tCommon = useTranslations("Common");
  const format = useCatalogFormat();
  const refresh = useRefreshCatalog(workspaceId);
  const { form, fieldError, formError } = useZodForm(updateVariantSchema, {
    sku: variant.sku ?? "",
    barcode: variant.barcode ?? "",
    costAmount: variant.costAmount,
    costCurrency: variant.costCurrency,
    // "10.000" se vería como diez mil: va sin los ceros de la base.
    reorderPoint: variant.reorderPoint && String(Number(variant.reorderPoint)),
  });
  const fields = ["sku", "barcode", "costAmount", "reorderPoint"] as const;

  const submit = form.handleSubmit(async (values) => {
    const result = await updateVariant(workspaceId, variant.id, values);
    if (!result.ok) {
      applyApiError(form, result.error, fields, { sku_taken: "sku" });
      return;
    }
    toast({ title: t("variant.saved"), variant: "success" });
    void refresh();
    onClose();
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <form noValidate onSubmit={submit} className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>
              {t("variant.title", {
                name: variant.name
                  ? `${productName} · ${variant.name}`
                  : productName,
              })}
            </DialogTitle>
          </DialogHeader>
          {formError && <Alert variant="destructive">{formError}</Alert>}
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label={t("fields.sku")} error={fieldError("sku")}>
              <Input
                {...form.register("sku")}
                maxLength={64}
                spellCheck={false}
                autoComplete="off"
                className="font-mono"
              />
            </FormField>
            <FormField
              label={t("fields.barcode")}
              error={fieldError("barcode")}
            >
              <Input
                {...form.register("barcode")}
                maxLength={64}
                inputMode="numeric"
                autoComplete="off"
              />
            </FormField>
            <Controller
              control={form.control}
              name="costAmount"
              render={({ field }) => (
                <FormField
                  label={t("fields.cost")}
                  error={fieldError("costAmount")}
                  required
                >
                  <MoneyInput
                    ref={field.ref}
                    value={field.value ?? null}
                    onValueChange={(value) => field.onChange(value ?? "")}
                    currency={form.watch("costCurrency") ?? "ARS"}
                    onCurrencyChange={(currency) =>
                      form.setValue("costCurrency", currency)
                    }
                    currencyLabel={t("fields.currency")}
                    locale={format.locale}
                  />
                </FormField>
              )}
            />
            <FormField
              label={t("fields.reorderPoint")}
              description={t("fields.reorderPointHelp")}
              error={fieldError("reorderPoint")}
            >
              <Input
                {...form.register("reorderPoint", {
                  setValueAs: optionalQuantity,
                })}
                inputMode="decimal"
                autoComplete="off"
              />
            </FormField>
          </div>
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
              {t("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
