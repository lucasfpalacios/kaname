"use client";

import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  toast,
  WorkspaceTile,
} from "@kaname/ui";
import type { AccountSummary } from "@kaname/shared";
import { useTranslations } from "next-intl";
import { useLayoutEffect, useState } from "react";
import { DialogContent } from "@/components/overlays";
import { useRouter } from "next/navigation";
import { createWorkspace, restoreWorkspace } from "@/lib/workspaces/api";
import { workspacePath } from "@/lib/workspaces/modules";
import { WorkspaceForm } from "./workspace-form";

// Tile "Nuevo espacio" del inicio: abre el alta en un diálogo. Solo aparece si soy Dueño de alguna
// cuenta. Al crear, va al espacio nuevo y refresca los datos del servidor (sidebar e inicio).
export function NewWorkspaceTile({ accounts }: { accounts: AccountSummary[] }) {
  const t = useTranslations("Workspace");
  const tAccount = useTranslations("Account");
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Next conserva oculta la página al navegar y la vuelve a mostrar tal como quedó: si se fue
  // con el diálogo abierto (o cerrándose), al volver tiene que estar cerrado. Los efectos de
  // layout corren al montar y cada vez que la página vuelve a mostrarse.
  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <WorkspaceTile
          variant="create"
          name={t("newWorkspace")}
          description={t("newWorkspaceDescription")}
        />
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("createTitle")}</DialogTitle>
          <DialogDescription>{t("createDescription")}</DialogDescription>
        </DialogHeader>
        <WorkspaceForm
          mode="create"
          accounts={accounts}
          submitLabel={t("create")}
          initial={{
            accountId: accounts[0].id,
            name: "",
            slug: "",
            type: "BUSINESS",
            color: null,
            baseCurrency: "ARS",
          }}
          onSubmit={async (values) => {
            const result = await createWorkspace(values);
            if (!result.ok) return result.error;
            setOpen(false);
            toast({ title: t("created"), variant: "success" });
            router.push(workspacePath(result.data.routeSlug));
            router.refresh();
            return null;
          }}
          onRestore={async (workspaceId, accountId) => {
            const result = await restoreWorkspace(accountId, workspaceId);
            if (!result.ok) {
              toast({
                title: tAccount("restoreError"),
                variant: "destructive",
              });
              return false;
            }
            setOpen(false);
            toast({ title: tAccount("restoredShort"), variant: "success" });
            router.refresh();
            return true;
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
