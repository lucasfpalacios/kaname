"use client";

import {
  Alert,
  Button,
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FormField,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
  toast,
} from "@kaname/ui";
import {
  ErrorCode,
  stockAdjustmentSchema,
  type VariantView,
} from "@kaname/shared";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { Controller } from "react-hook-form";
import { z } from "zod";
import { DialogContent } from "@/components/overlays";
import { applyApiError, useZodForm } from "@/components/use-zod-form";
import { adjustStock } from "@/lib/catalog/api";
import { useCatalogFormat, useRefreshCatalog } from "./use-catalog";

// La cantidad se escribe sin signo (con coma o punto decimal) y el sentido se elige aparte.
const adjustFormSchema = z.object({
  direction: z.enum(["add", "remove"]),
  quantity: z
    .string(ErrorCode.quantityInvalid)
    .trim()
    .transform((value) => value.replace(",", "."))
    .pipe(
      z
        .string()
        .regex(/^\d{1,11}(\.\d{1,3})?$/, ErrorCode.quantityInvalid)
        .refine((value) => Number(value) > 0, ErrorCode.quantityInvalid),
    ),
  note: stockAdjustmentSchema.shape.note,
});

type AdjustValues = z.output<typeof adjustFormSchema>;

// Ajuste de stock de una variante: cantidad que suma o resta y una nota. Antes de guardar se
// confirma con el stock resultante; si la API dice que quedaría negativo, vuelve al formulario.
export function StockAdjustDialog({
  workspaceId,
  productName,
  variant,
  onClose,
  onDone,
}: {
  workspaceId: string;
  productName: string;
  variant: VariantView | null;
  onClose: () => void;
  onDone: (variant: VariantView) => void;
}) {
  const t = useTranslations("Products");
  return (
    <Dialog open={variant !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        {variant && (
          <AdjustForm
            key={variant.id}
            workspaceId={workspaceId}
            title={t("adjust.title", {
              name: variant.name
                ? `${productName} · ${variant.name}`
                : productName,
            })}
            variant={variant}
            onDone={onDone}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function AdjustForm({
  workspaceId,
  title,
  variant,
  onDone,
}: {
  workspaceId: string;
  title: string;
  variant: VariantView;
  onDone: (variant: VariantView) => void;
}) {
  const t = useTranslations("Products");
  const tCommon = useTranslations("Common");
  const id = useId();
  const format = useCatalogFormat();
  const refresh = useRefreshCatalog(workspaceId);
  const { form, fieldError, formError } = useZodForm(adjustFormSchema, {
    direction: "add",
    quantity: "",
    note: "",
  });
  // Paso de confirmación: los valores ya validados.
  const [pending, setPending] = useState<AdjustValues | null>(null);

  const units = (value: number) =>
    t("units", { quantity: format.quantity(String(value)) });

  async function confirm() {
    if (!pending) return;
    const quantity =
      pending.direction === "remove"
        ? `-${pending.quantity}`
        : pending.quantity;
    const result = await adjustStock(workspaceId, variant.id, {
      quantity,
      note: pending.note,
    });
    setPending(null);
    if (!result.ok) {
      applyApiError(form, result.error, ["quantity", "note"], {
        stock_negative: "quantity",
        quantity_invalid: "quantity",
      });
      return;
    }
    toast({ title: t("adjust.done"), variant: "success" });
    void refresh();
    onDone(result.data.variant);
  }

  if (pending) {
    const delta =
      Number(pending.quantity) * (pending.direction === "remove" ? -1 : 1);
    const after = Number(variant.stock) + delta;
    return (
      <>
        <DialogHeader>
          <DialogTitle>{t("adjust.confirmTitle")}</DialogTitle>
          <DialogDescription>
            {t(
              pending.direction === "add"
                ? "adjust.confirmAdd"
                : "adjust.confirmRemove",
              {
                quantity: units(Number(pending.quantity)),
                before: units(Number(variant.stock)),
                after: units(after),
              },
            )}
          </DialogDescription>
        </DialogHeader>
        {after < 0 && (
          <Alert variant="destructive">{t("adjust.negativeWarning")}</Alert>
        )}
        <DialogFooter>
          <Button variant="secondary" onClick={() => setPending(null)}>
            {t("adjust.back")}
          </Button>
          <Button onClick={() => void confirm()} disabled={after < 0} autoFocus>
            {t("adjust.confirm")}
          </Button>
        </DialogFooter>
      </>
    );
  }

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit((values) => setPending(values))}
      className="flex flex-col gap-5"
    >
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>
          {t("adjust.current", { quantity: units(Number(variant.stock)) })}
        </DialogDescription>
      </DialogHeader>
      {formError && <Alert variant="destructive">{formError}</Alert>}
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">
          {t("adjust.direction")}
        </legend>
        <Controller
          control={form.control}
          name="direction"
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="flex gap-6"
            >
              {(["add", "remove"] as const).map((option) => (
                <div key={option} className="flex items-center gap-2">
                  <RadioGroupItem id={`${id}-${option}`} value={option} />
                  <Label htmlFor={`${id}-${option}`}>
                    {t(`adjust.${option}`)}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
        />
      </fieldset>
      <FormField
        label={t("adjust.quantity")}
        error={fieldError("quantity")}
        required
      >
        <Input
          {...form.register("quantity")}
          inputMode="decimal"
          autoComplete="off"
          className="max-w-40"
          autoFocus
        />
      </FormField>
      <FormField label={t("adjust.note")} error={fieldError("note")}>
        <Input
          {...form.register("note")}
          placeholder={t("adjust.notePlaceholder")}
          maxLength={500}
        />
      </FormField>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            {tCommon("cancel")}
          </Button>
        </DialogClose>
        <Button type="submit">{t("adjust.continue")}</Button>
      </DialogFooter>
    </form>
  );
}
