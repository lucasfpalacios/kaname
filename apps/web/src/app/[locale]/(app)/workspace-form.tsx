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
  WorkspaceColorField,
} from "@kaname/ui";
import {
  type AccountSummary,
  type Currency,
  currencySchema,
  slugify,
  type WorkspaceType,
  workspaceTypeSchema,
} from "@kaname/shared";
import { ArchiveRestore } from "lucide-react";
import { useTranslations } from "next-intl";
import { type FormEvent, useId, useState } from "react";
import { useErrorMessage } from "@/components/use-error-message";
import type { ApiError } from "@/lib/api/errors";
import { workspaceInitials } from "@/lib/workspaces/modules";

export type WorkspaceFormValues = {
  accountId: string;
  name: string;
  slug: string;
  type: WorkspaceType;
  color: string | null;
  baseCurrency: Currency;
};

// Datos de un espacio: nombre, dirección (slug), tipo, moneda base y color con vista previa. Lo
// usan el alta (diálogo del inicio) y la configuración. En el alta, la dirección se arma sola a
// partir del nombre hasta que la persona la edita.
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
  const errorMessage = useErrorMessage();
  const id = useId();
  const [values, setValues] = useState(initial);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  // Espacio archivado que usa la dirección elegida (slug_archived).
  const [archivedId, setArchivedId] = useState<string | null>(null);

  const set = <K extends keyof WorkspaceFormValues>(
    key: K,
    value: WorkspaceFormValues[K],
  ) => setValues((current) => ({ ...current, [key]: value }));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setFormError(null);
    setFieldErrors({});
    setArchivedId(null);
    const error = await onSubmit(values);
    setPending(false);
    if (!error) return;
    if (error.issues.length > 0) {
      setFieldErrors(
        Object.fromEntries(
          error.issues.map((issue) => [issue.path, errorMessage(issue.code)]),
        ),
      );
    } else if (error.code === "slug_taken" || error.code === "slug_archived") {
      setFieldErrors({ slug: errorMessage(error.code) });
      setArchivedId(error.workspaceId ?? null);
    } else {
      setFormError(
        error.code === "unknown" ? t("saveError") : errorMessage(error.code),
      );
    }
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      {formError && <Alert variant="destructive">{formError}</Alert>}
      {mode === "create" && accounts.length > 1 && (
        <FormField label={t("account")} required>
          <Select
            value={values.accountId}
            onValueChange={(accountId) => set("accountId", accountId)}
          >
            <SelectTrigger>
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
        </FormField>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label={t("name")} error={fieldErrors.name} required>
          <Input
            name="name"
            value={values.name}
            placeholder={t("namePlaceholder")}
            maxLength={80}
            autoFocus={mode === "create"}
            onChange={(event) => {
              const name = event.target.value;
              setValues((current) => ({
                ...current,
                name,
                slug: slugTouched ? current.slug : slugify(name),
              }));
            }}
          />
        </FormField>
        <FormField
          label={t("slug")}
          description={t("slugHelp", { slug: values.slug || "…" })}
          error={fieldErrors.slug}
          required
        >
          <Input
            name="slug"
            value={values.slug}
            maxLength={48}
            spellCheck={false}
            autoComplete="off"
            onChange={(event) => {
              setSlugTouched(true);
              set("slug", event.target.value.toLowerCase());
            }}
          />
        </FormField>
        {archivedId && onRestore && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="self-start sm:col-start-2"
            onClick={() => void onRestore(archivedId, values.accountId)}
          >
            <ArchiveRestore />
            {t("restoreArchived")}
          </Button>
        )}
      </div>
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 text-sm font-medium">{t("type")}</legend>
        <RadioGroup
          value={values.type}
          onValueChange={(type) => set("type", type as WorkspaceType)}
          className="grid gap-3 sm:grid-cols-2"
        >
          {workspaceTypeSchema.options.map((type) => (
            <div key={type} className="flex items-start gap-3">
              <RadioGroupItem
                id={`${id}-${type}`}
                value={type}
                aria-describedby={`${id}-${type}-help`}
                className="mt-0.5"
              />
              <div className="flex flex-col gap-0.5">
                <Label htmlFor={`${id}-${type}`}>{t(`types.${type}`)}</Label>
                {mode === "create" && (
                  <p
                    id={`${id}-${type}-help`}
                    className="text-xs text-foreground/70"
                  >
                    {t(`typeHelp.${type}`)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </RadioGroup>
      </fieldset>
      <FormField label={t("baseCurrency")} className="max-w-56" required>
        <Select
          value={values.baseCurrency}
          onValueChange={(currency) =>
            set("baseCurrency", currency as Currency)
          }
        >
          <SelectTrigger>
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
      </FormField>
      <WorkspaceColorField
        value={values.color}
        onChange={(color) => set("color", color)}
        error={fieldErrors.color}
        labels={{
          legend: t("colorLegend"),
          none: t("colorNone"),
          custom: t("colorCustom"),
          preview: t("colorPreview"),
        }}
        preview={{
          name: values.name || t("namePlaceholder"),
          initials: workspaceInitials(values.name || t("namePlaceholder")),
          badge: t(`types.${values.type}`),
        }}
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          aria-busy={pending || undefined}
          disabled={pending}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
