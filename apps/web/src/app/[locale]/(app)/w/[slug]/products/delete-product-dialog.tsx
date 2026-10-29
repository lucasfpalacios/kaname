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
  toast,
} from "@kaname/ui";
import type { ProductListItem } from "@kaname/shared";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { DialogContent } from "@/components/overlays";
import { useErrorMessage } from "@/components/use-error-message";
import { deleteProduct, setProductArchived } from "@/lib/catalog/api";

// Borrar un producto, con confirmación. Uno con historial no se borra (la API responde
// has_history): el diálogo lo explica y ofrece archivarlo, si se tiene permiso de editar.
export function DeleteProductDialog({
  workspaceId,
  product,
  canArchive,
  onClose,
  onDone,
}: {
  workspaceId: string;
  product: ProductListItem | null;
  canArchive: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const t = useTranslations("Products");
  const tCommon = useTranslations("Common");
  const errorMessage = useErrorMessage();
  const [hasHistory, setHasHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function close() {
    setHasHistory(false);
    setError(null);
    onClose();
  }

  async function run(action: "delete" | "archive") {
    if (!product) return;
    setBusy(true);
    setError(null);
    const result =
      action === "delete"
        ? await deleteProduct(workspaceId, product.id)
        : await setProductArchived(workspaceId, product.id, true);
    setBusy(false);
    if (!result.ok) {
      if (result.error.code === "has_history") setHasHistory(true);
      else setError(errorMessage(result.error.code));
      return;
    }
    toast({
      title: t(action === "delete" ? "deleted" : "archived", {
        name: product.name,
      }),
      variant: "success",
    });
    setHasHistory(false);
    onDone();
  }

  return (
    <Dialog open={product !== null} onOpenChange={(open) => !open && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {hasHistory
              ? t("historyTitle")
              : t("deleteTitle", { name: product?.name ?? "" })}
          </DialogTitle>
          <DialogDescription>
            {hasHistory
              ? t(canArchive ? "historyBody" : "historyBodyNoArchive")
              : t("deleteBody")}
          </DialogDescription>
        </DialogHeader>
        {error && <Alert variant="destructive">{error}</Alert>}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">{tCommon("cancel")}</Button>
          </DialogClose>
          {hasHistory ? (
            canArchive && (
              <Button
                key="archive"
                disabled={busy}
                aria-busy={busy || undefined}
                onClick={() => void run("archive")}
              >
                {t("archive")}
              </Button>
            )
          ) : (
            <Button
              key="delete"
              variant="destructive"
              disabled={busy}
              aria-busy={busy || undefined}
              onClick={() => void run("delete")}
            >
              {t("delete")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
