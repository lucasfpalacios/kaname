import { PageHeader, WorkspaceTile } from "@kaname/ui";
import { LayoutGrid } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { getAccounts, getCurrentUser, getWorkspaces } from "@/lib/api/server";
import { workspaceInitials, workspacePath } from "@/lib/workspaces/modules";
import { NewWorkspaceTile } from "./new-workspace-tile";
import { UpcomingEvents } from "./upcoming-events";

// Inicio (launcher): un botón grande por espacio, "General" para el panel consolidado y "Nuevo
// espacio" si soy Dueño de alguna cuenta.
export default async function Home() {
  const [t, tShell, tModules, user, workspaces, accounts] = await Promise.all([
    getTranslations("Home"),
    getTranslations("Shell"),
    getTranslations("Modules"),
    getCurrentUser(),
    getWorkspaces(),
    getAccounts(),
  ]);
  const ownedAccounts = (accounts ?? []).filter(
    (account) => account.role === "OWNER",
  );

  return (
    <>
      <PageHeader
        title={t("greeting", { name: user?.name.split(" ")[0] ?? "" })}
        description={t("workspaceCount", { count: workspaces?.length ?? 0 })}
      />
      <section
        aria-label={t("workspacesLabel")}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        <WorkspaceTile
          asChild
          name={tModules("GENERAL")}
          description={tShell("generalDescription")}
          icon={<LayoutGrid />}
        >
          <Link href="/general" />
        </WorkspaceTile>
        {workspaces?.map((workspace) => (
          <WorkspaceTile
            key={workspace.id}
            asChild
            name={workspace.name}
            description={tShell(`types.${workspace.type}`)}
            initials={workspaceInitials(workspace.name)}
            color={workspace.color}
          >
            <Link href={workspacePath(workspace.routeSlug)} />
          </WorkspaceTile>
        ))}
        {ownedAccounts.length > 0 && (
          <NewWorkspaceTile accounts={ownedAccounts} />
        )}
      </section>
      <UpcomingEvents />
    </>
  );
}
