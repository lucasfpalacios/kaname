"use client";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  toast,
  WorkspaceAvatar,
} from "@kaname/ui";
import type { ArchivedWorkspace } from "@kaname/shared";
import { Archive, ArchiveRestore } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { restoreWorkspace } from "@/lib/workspaces/api";
import { workspaceInitials } from "@/lib/workspaces/modules";

type Row = ArchivedWorkspace & { archivedOn: string };

// Espacios archivados de una cuenta. Restaurar refresca los datos del servidor: el espacio vuelve
// al inicio y al menú sin recargar la página.
export function ArchivedWorkspaces({
  accountId,
  accountName,
  workspaces,
}: {
  accountId: string;
  accountName?: string;
  workspaces: Row[];
}) {
  const t = useTranslations("Account");
  const tShell = useTranslations("Shell");
  const router = useRouter();
  const [restoring, setRestoring] = useState<string | null>(null);

  async function restore(workspace: Row) {
    setRestoring(workspace.id);
    const result = await restoreWorkspace(accountId, workspace.id);
    setRestoring(null);
    if (!result.ok) {
      toast({ title: t("restoreError"), variant: "destructive" });
      return;
    }
    toast({
      title: t("restored", { name: workspace.name }),
      variant: "success",
    });
    router.refresh();
  }

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle asChild>
          <h2 className="text-lg">
            {accountName ? `${t("archived")} · ${accountName}` : t("archived")}
          </h2>
        </CardTitle>
        <CardDescription>{t("archivedDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        {workspaces.length === 0 ? (
          <EmptyState
            variant="plain"
            className="py-6"
            icon={<Archive />}
            title={t("empty")}
            description={t("emptyDescription")}
          />
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {workspaces.map((workspace) => (
              <li
                key={workspace.id}
                className="flex flex-wrap items-center gap-3 py-3"
              >
                <WorkspaceAvatar
                  initials={workspaceInitials(workspace.name)}
                  color={workspace.color}
                />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-medium">{workspace.name}</span>
                  <span className="text-sm text-foreground/70">
                    {tShell(`types.${workspace.type}`)} ·{" "}
                    {t("archivedOn", { date: workspace.archivedOn })}
                  </span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  aria-busy={restoring === workspace.id || undefined}
                  disabled={restoring !== null}
                  onClick={() => void restore(workspace)}
                >
                  <ArchiveRestore />
                  {t("restore")}
                  <span className="sr-only"> {workspace.name}</span>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
