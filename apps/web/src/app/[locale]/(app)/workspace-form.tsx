"use client";

import {
  Alert,
  Button,
  FormField,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  WORKSPACE_COLOR_SUGGESTIONS,
  WorkspaceColorField,
} from "@kaname/ui";
import {
  type AccountSummary,
  createWorkspaceSchema,
  currencySchema,
  slugify,
  workspaceTypeSchema,
} from "@kaname/shared";
import { ArchiveRestore } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useRef, useState } from "react";
import { Controller, type Path } from "react-hook-form";
import type { z } from "zod";
import { useErrorMessage } from "@/components/use-error-message";
import { applyApiError, useZodForm } from "@/components/use-zod-form";
import type { ApiError } from "@/lib/api/errors";
import { workspaceInitials } from "@/lib/workspaces/modules";

/** Lo que entrega el formulario (ya validado y normalizado por el schema). */
export type WorkspaceFormValues = z.output<typeof createWorkspaceSchema>;
type FormInput = z.input<typeof createWorkspaceSchema>;

// Datos de un espacio: nombre, dirección (slug), tipo, moneda base y color con vista previa. Lo
// usan el alta (diálogo del inicio) y la configuración. Valida con el mismo schema que la API
// (createWorkspaceSchema de @kaname/shared). En el alta, la dirección se arma sola a partir del
// nombre hasta que la persona la edita.
export function WorkspaceForm({
  mode,
  initial,
  accounts = [],
  submitLabel,
  onSubmit,
  onRestore,
}: {
  mode: "create" | "edit";
  initial: WorkspaceFormValues;
  /** Cuentas donde se puede crear (soy Dueño). El selector aparece si hay más de una. */
  accounts?: AccountSummary[];
  submitLabel: string;
  /** Devuelve el error de la API, o null si salió bien. */
  onSubmit: (values: WorkspaceFormValues) => Promise<ApiError | null>;
  /**
   * Si la dirección es de un espacio archivado de la cuenta, el formulario ofrece restaurarlo con
   * esto (en el alta). Devuelve true si salió bien.
   */
  onRestore?: (workspaceId: string, accountId: string) => Promise<boolean>;
}) {
  const t = useTranslations("Workspace");
  const tColors = useTranslations("Workspace.colors");
  const errorMessage = useErrorMessage();
  const id = useId();
  const { form, fieldError, formError } = useZodForm(
    createWorkspaceSchema,
    initial,
  );
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  // Espacio archivado que usa la dirección elegida (slug_archived).
  const [archivedId, setArchivedId] = useState<string | null>(null);
  // El color propio escrito no es #rrggbb: no se puede guardar (se guardaría el anterior).
  const [colorValid, setColorValid] = useState(true);
  const formRef = useRef<HTMLFormElement>(null);
  const showAccount = mode === "create" && accounts.length > 1;
  const name = form.watch("name");
  const type = form.watch("type");

  // Campos con control en pantalla: los errores de los demás van al error general.
  const fields: Path<FormInput>[] = [
    ...(showAccount ? (["accountId"] as const) : []),
    "name",
    "slug",
    "type",
    "baseCurrency",
    "color",
  ];

  const submit = form.handleSubmit(async (values) => {
    setArchivedId(null);
    const error = await onSubmit(values);
    if (!error) return;
    applyApiError(form, error, fields, {
      slug_taken: "slug",
      slug_archived: "slug",
    });
    if (error.code === "slug_archived")
      setArchivedId(error.workspaceId ?? null);
  });

  return (
    <form
      ref={formRef}
      onSubmit={(event) => {
        // Un color a medio escribir no pasa por el schema (el valor sigue siendo el anterior).
        if (!colorValid) {
          event.preventDefault();
          form.setError("color", { message: "color_invalid" });
          // El campo del color propio está dentro del componente del kit: se lo busca en el form
          // por su data-slot (el grupo de sugerencias también tiene inputs, ocultos).
          formRef.current
            ?.querySelector<HTMLInputElement>(
              '[data-slot="workspace-color-field"] [data-slot="input"]',
            )
            ?.focus();
          return;
        }
        void submit(event);
      }}
      noValidate
      className="flex flex-col gap-5"
    >
      {formError && <Alert variant="destructive">{formError}</Alert>}
      {showAccount && (
        <FormField
          label={t("account")}
          error={fieldError("accountId")}
          required
        >
          <Controller
            control={form.control}
            name="accountId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger ref={field.ref}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label={t("name")} error={fieldError("name")} required>
          <Input
            {...form.register("name", {
              onChange: (event) => {
                if (!slugTouched) {
                  form.setValue("slug", slugify(event.target.value));
                }
              },
            })}
            placeholder={t("namePlaceholder")}
            maxLength={80}
            autoFocus={mode === "create"}
          />
        </FormField>
        <Controller
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormField
              label={t("slug")}
              description={t("slugHelp", { slug: field.value || "…" })}
              error={fieldError("slug")}
              required
            >
              <Input
                ref={field.ref}
                name={field.name}
                value={field.value}
                onBlur={field.onBlur}
                maxLength={48}
                spellCheck={false}
                autoComplete="off"
                onChange={(event) => {
                  setSlugTouched(true);
                  field.onChange(event.target.value.toLowerCase());
                }}
              />
            </FormField>
          )}
        />
        {archivedId && onRestore && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="self-start sm:col-start-2"
            onClick={() =>
              void onRestore(archivedId, form.getValues("accountId"))
            }
          >
            <ArchiveRestore />
            {t("restoreArchived")}
          </Button>
        )}
      </div>
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 text-sm font-medium">{t("type")}</legend>
        <Controller
          control={form.control}
          name="type"
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              aria-invalid={Boolean(fieldError("type")) || undefined}
              className="grid gap-3 sm:grid-cols-2"
            >
              {workspaceTypeSchema.options.map((option, index) => (
                <div key={option} className="flex items-start gap-3">
                  <RadioGroupItem
                    // El foco de un error va a la primera opción.
                    ref={index === 0 ? field.ref : undefined}
                    id={`${id}-${option}`}
                    value={option}
                    aria-describedby={`${id}-${option}-help`}
                    className="mt-0.5"
                  />
                  <div className="flex flex-col gap-0.5">
                    <Label htmlFor={`${id}-${option}`}>
                      {t(`types.${option}`)}
                    </Label>
                    {mode === "create" && (
                      <p
                        id={`${id}-${option}-help`}
                        className="text-xs text-foreground/70"
                      >
                        {t(`typeHelp.${option}`)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </RadioGroup>
          )}
        />
        {fieldError("type") && (
          <p className="text-sm text-destructive">{fieldError("type")}</p>
        )}
      </fieldset>
      <FormField
        label={t("baseCurrency")}
        error={fieldError("baseCurrency")}
        className="max-w-56"
        required
      >
        <Controller
          control={form.control}
          name="baseCurrency"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger ref={field.ref}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencySchema.options.map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {t(`currencies.${currency}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>
      <Controller
        control={form.control}
        name="color"
        render={({ field }) => (
          <WorkspaceColorField
            value={field.value ?? null}
            onChange={(color) => {
              field.onChange(color);
              form.clearErrors("color");
            }}
            onValidityChange={setColorValid}
            colorNames={Object.fromEntries(
              WORKSPACE_COLOR_SUGGESTIONS.map((color) => [
                color,
                tColors(color.slice(1) as Parameters<typeof tColors>[0]),
              ]),
            )}
            inputRef={field.ref}
            error={fieldError("color")}
            labels={{
              legend: t("colorLegend"),
              none: t("colorNone"),
              custom: t("colorCustom"),
              preview: t("colorPreview"),
              invalid: errorMessage("color_invalid"),
              announce: (color) =>
                t("colorAnnounce", { color: color ?? t("colorNone") }),
            }}
            preview={{
              name: name || t("namePlaceholder"),
              initials: workspaceInitials(name || t("namePlaceholder")),
              badge: t(`types.${type}`),
            }}
          />
        )}
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          aria-busy={form.formState.isSubmitting || undefined}
          disabled={form.formState.isSubmitting}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
