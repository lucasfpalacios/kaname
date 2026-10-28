"use client";

import {
  DialogContent as KitDialogContent,
  type DialogContentProps,
  SheetContent as KitSheetContent,
  type SheetContentProps,
} from "@kaname/ui";
import { useTranslations } from "next-intl";

// DialogContent y SheetContent del kit con la X de cerrar traducida. En la web se usan estos, así
// ningún diálogo queda sin botón de cerrar ni con el texto sin traducir.
export function DialogContent(props: Omit<DialogContentProps, "closeLabel">) {
  const t = useTranslations("Common");
  return <KitDialogContent closeLabel={t("close")} {...props} />;
}

export function SheetContent(props: Omit<SheetContentProps, "closeLabel">) {
  const t = useTranslations("Common");
  return <KitSheetContent closeLabel={t("close")} {...props} />;
}
