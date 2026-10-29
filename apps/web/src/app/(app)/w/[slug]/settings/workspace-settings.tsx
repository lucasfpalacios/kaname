"use client";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  ModuleSwitch,
  toast,
} from "@kaname/ui";
import {
  type ModuleKey,
  moduleKeySchema,
  type WorkspaceSummary,
} from "@kaname/shared";
import { Archive } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { DialogContent } from "@/components/overlays";
import { useRouter } from "next/navigation";
import { archiveWorkspace, updateWorkspace } from "@/lib/workspaces/api";
import { workspacePath } from "@/lib/workspaces/modules";
import { MODULE_ICON } from "../../../module-icons";
import { WorkspaceForm } from "../../../workspace-form";

// Configuración de un espacio: datos generales y color, módulos activos y archivar. Cada cambio
// refresca los datos del servidor (router.refresh): el sidebar y el inicio se actualizan sin
// recargar la página.
export function WorkspaceSettings({
  workspace,
}: {
  workspace: WorkspaceSummary;
}) {
  const t = useTranslations("Workspace");
  const tModules = useTranslations("Modules");
  const tCommon = useTranslations("Common");
  const router = useRouter();
  const [modules, setModules] = useState<ModuleKey[]>(workspace.modules);
  // Un guardado de módulos a la vez: mientras hay uno en curso, los switches no responden.
  const [savingModule, setSavingModule] = useState<ModuleKey | null>(null);
  const [archiving, setArchiving] = useState(false);
  // Controlado: se cierra antes de navegar (la página queda oculta tal como está).
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function toggleModule(module: ModuleKey, enabled: boolean) {
    if (savingModule) return;
    const previous = modules;
    // Se respeta el orden actual; uno que se activa va al final. El switch cambia enseguida y,
    // al terminar, la pantalla toma la lista que devolvió la API (o vuelve a la anterior).
    const next = enabled
      ? [...modules, module]
      : modules.filter((item) => item !== module);
    setModules(next);
    setSavingModule(module);
    const result = await updateWorkspace(workspace.id, { modules: next });
    setSavingModule(null);
    if (!result.ok) {
      setModules(previous);
      toast({ title: t("saveError"), variant: "destructive" });
      return;
    }
    setModules(result.data.modules);
    toast({
      title: t(enabled ? "moduleOn" : "moduleOff", {
        module: tModules(module),
      }),
    });
    router.refresh();
  }

  async function archive() {
    setArchiving(true);
    const result = await archiveWorkspace(workspace.id);
    if (!result.ok) {
      setArchiving(false);
      toast({ title: t("saveError"), variant: "destructive" });
      return;
    }
    setConfirmOpen(false);
    toast({ title: t("archived", { name: workspace.name }) });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle asChild>
            <h2 className="text-lg">{t("general")}</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WorkspaceForm
            mode="edit"
            submitLabel={t("save")}
            initial={{
              accountId: workspace.accountId,
              name: workspace.name,
              slug: workspace.slug,
              type: workspace.type,
              color: workspace.color,
              baseCurrency: workspace.baseCurrency,
            }}
            onSubmit={async (values) => {
              // La cuenta no se cambia: el resto va a la API.
              const { name, slug, type, color, baseCurrency } = values;
              const result = await updateWorkspace(workspace.id, {
                name,
                slug,
                type,
                color,
                baseCurrency,
              });
              if (!result.ok) return result.error;
              toast({ title: t("saved"), variant: "success" });
              // Si cambió la dirección, la página pasa a la nueva.
              if (result.data.routeSlug !== workspace.routeSlug) {
                router.replace(
                  `${workspacePath(result.data.routeSlug)}/settings`,
                );
              }
              router.refresh();
              return null;
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle asChild>
            <h2 className="text-lg">{t("modules")}</h2>
          </CardTitle>
          <CardDescription>{t("modulesDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          {moduleKeySchema.options.map((module) => (
            <ModuleSwitch
              key={module}
              module={module}
              icon={MODULE_ICON[module]}
              label={tModules(module)}
              description={module === "DASHBOARD" ? t("alwaysOn") : undefined}
              checked={module === "DASHBOARD" || modules.includes(module)}
              disabled={module === "DASHBOARD" || savingModule !== null}
              onCheckedChange={(enabled) => void toggleModule(module, enabled)}
            />
          ))}
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle asChild>
            <h2 className="text-lg">{t("archive")}</h2>
          </CardTitle>
          <CardDescription>{t("archiveDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Archive />
                {t("archive")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {t("archiveConfirmTitle", { name: workspace.name })}
                </DialogTitle>
                <DialogDescription>{t("archiveConfirmBody")}</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">{tCommon("cancel")}</Button>
                </DialogClose>
                <Button
                  variant="destructive"
                  aria-busy={archiving || undefined}
                  disabled={archiving}
                  onClick={() => void archive()}
                >
                  {t("archive")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
