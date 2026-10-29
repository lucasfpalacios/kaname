"use client";

import {
  Alert,
  Button,
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  FormField,
  IconButton,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  toast,
} from "@kaname/ui";
import {
  type CategorySummary,
  categorySchema,
  type ModulePermissions,
} from "@kaname/shared";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Controller } from "react-hook-form";
import { DialogContent } from "@/components/overlays";
import { useErrorMessage } from "@/components/use-error-message";
import { applyApiError, useZodForm } from "@/components/use-zod-form";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/lib/catalog/api";
import { useCategories, useRefreshCatalog } from "./use-catalog";

/** Valor del select de padre para "sin padre" (Radix no acepta "" como valor). */
const ROOT = "__root";

// Categorías del espacio: alta (con padre opcional, un solo nivel), renombrar y borrar. Sus
// productos quedan sin categoría al borrarla; una con subcategorías no se borra.
export function CategoriesDialog({
  workspaceId,
  open,
  onOpenChange,
  permissions,
}: {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permissions: ModulePermissions;
}) {
  const t = useTranslations("Products.categories");
  const categories = useCategories(workspaceId);
  const roots = (categories.data ?? []).filter((item) => !item.parentId);
  // Raíces y, debajo de cada una, sus subcategorías.
  const ordered = roots.flatMap((root) => [
    root,
    ...(categories.data ?? []).filter((item) => item.parentId === root.id),
  ]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        {permissions.create && (
          <NewCategory workspaceId={workspaceId} roots={roots} />
        )}
        {categories.isPending ? (
          <Skeleton className="h-24 w-full" />
        ) : categories.isError ? (
          <Alert variant="destructive">{t("loadError")}</Alert>
        ) : ordered.length === 0 ? (
          <p className="rounded-md border border-dashed border-border px-3 py-4 text-center text-sm text-foreground/70">
            {t("empty")}
          </p>
        ) : (
          <ul className="flex max-h-80 flex-col divide-y divide-border overflow-y-auto rounded-md border border-border">
            {ordered.map((category) => (
              <CategoryRow
                key={category.id}
                workspaceId={workspaceId}
                category={category}
                permissions={permissions}
              />
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}

function NewCategory({
  workspaceId,
  roots,
}: {
  workspaceId: string;
  roots: CategorySummary[];
}) {
  const t = useTranslations("Products.categories");
  const refresh = useRefreshCatalog(workspaceId);
  const { form, fieldError, formError } = useZodForm(categorySchema, {
    name: "",
    parentId: null,
  });

  const submit = form.handleSubmit(async (values) => {
    const result = await createCategory(workspaceId, values);
    if (!result.ok) {
      applyApiError(form, result.error, ["name", "parentId"], {
        category_name_taken: "name",
      });
      return;
    }
    toast({ title: t("created", { name: values.name }), variant: "success" });
    form.reset({ name: "", parentId: values.parentId });
    void refresh();
  });

  return (
    <form
      noValidate
      onSubmit={submit}
      className="flex flex-col gap-3 rounded-md border border-border p-3"
    >
      {formError && <Alert variant="destructive">{formError}</Alert>}
      <div className="grid gap-3 sm:grid-cols-[1fr_12rem]">
        <FormField label={t("name")} error={fieldError("name")} required>
          <Input
            {...form.register("name")}
            maxLength={120}
            placeholder={t("namePlaceholder")}
          />
        </FormField>
        <FormField label={t("parent")} error={fieldError("parentId")}>
          <Controller
            control={form.control}
            name="parentId"
            render={({ field }) => (
              <Select
                value={field.value ?? ROOT}
                onValueChange={(value) =>
                  field.onChange(value === ROOT ? null : value)
                }
              >
                <SelectTrigger ref={field.ref}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ROOT}>{t("noParent")}</SelectItem>
                  {roots.map((root) => (
                    <SelectItem key={root.id} value={root.id}>
                      {root.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
      </div>
      <Button
        type="submit"
        size="sm"
        className="self-end"
        disabled={form.formState.isSubmitting}
        aria-busy={form.formState.isSubmitting || undefined}
      >
        <Plus />
        {t("add")}
      </Button>
    </form>
  );
}

function CategoryRow({
  workspaceId,
  category,
  permissions,
}: {
  workspaceId: string;
  category: CategorySummary;
  permissions: ModulePermissions;
}) {
  const t = useTranslations("Products.categories");
  const errorMessage = useErrorMessage();
  const refresh = useRefreshCatalog(workspaceId);
  const [mode, setMode] = useState<"view" | "rename" | "delete">("view");
  const [name, setName] = useState(category.name);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(action: "rename" | "delete") {
    setBusy(true);
    setError(null);
    const result =
      action === "rename"
        ? await updateCategory(workspaceId, category.id, { name })
        : await deleteCategory(workspaceId, category.id);
    setBusy(false);
    if (!result.ok) {
      const issue = result.error.issues[0]?.code;
      setError(errorMessage(issue ?? result.error.code));
      return;
    }
    if (action === "delete") {
      toast({ title: t("deleted", { name: category.name }) });
    }
    setMode("view");
    void refresh();
  }

  return (
    <li
      className={
        category.parentId
          ? "flex flex-col gap-2 py-2 pr-2 pl-8"
          : "flex flex-col gap-2 py-2 pr-2 pl-3"
      }
    >
      <div className="flex items-center gap-2">
        {mode === "rename" ? (
          <form
            className="flex flex-1 items-center gap-1"
            onSubmit={(event) => {
              event.preventDefault();
              void run("rename");
            }}
          >
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              aria-label={t("name")}
              maxLength={120}
              className="h-8"
              autoFocus
            />
            <IconButton
              size="sm"
              type="submit"
              label={t("save")}
              disabled={busy}
            >
              <Check />
            </IconButton>
            <IconButton
              type="button"
              size="sm"
              label={t("cancelRename")}
              onClick={() => {
                setName(category.name);
                setError(null);
                setMode("view");
              }}
            >
              <X />
            </IconButton>
          </form>
        ) : (
          <>
            <span className="min-w-0 flex-1 truncate text-sm font-medium">
              {category.name}
            </span>
            <span className="text-xs whitespace-nowrap text-foreground/70">
              {t("products", { count: category.productCount })}
            </span>
            {permissions.edit && mode === "view" && (
              <IconButton
                type="button"
                size="sm"
                label={t("rename", { name: category.name })}
                onClick={() => setMode("rename")}
              >
                <Pencil />
              </IconButton>
            )}
            {permissions.delete && mode === "view" && (
              <IconButton
                type="button"
                size="sm"
                label={t("delete", { name: category.name })}
                onClick={() => setMode("delete")}
              >
                <Trash2 />
              </IconButton>
            )}
          </>
        )}
      </div>
      {mode === "delete" && (
        <div className="flex flex-wrap items-center justify-end gap-2 text-sm">
          <span className="flex-1 text-foreground/80">
            {t("deleteConfirm", { count: category.productCount })}
          </span>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setError(null);
              setMode("view");
            }}
          >
            {t("cancelRename")}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            disabled={busy}
            aria-busy={busy || undefined}
            onClick={() => void run("delete")}
          >
            {t("deleteAction")}
          </Button>
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </li>
  );
}
