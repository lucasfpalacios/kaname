import { EmptyState, PageHeader, WorkspaceAvatar } from "@kaname/ui";
import { Construction } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { getWorkspaceBySlug } from "@/lib/api/server";
import { workspaceInitials } from "@/lib/workspaces/modules";

// Resumen del espacio (módulo DASHBOARD). Los widgets llegan en la Fase 7.
export default async function WorkspacePage({
  params,
}: PageProps<"/[locale]/w/[slug]">) {
  const { slug } = await params;
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) notFound();
  const [tShell, tPages] = await Promise.all([
    getTranslations("Shell"),
    getTranslations("Pages"),
  ]);
  return (
    <>
      <PageHeader
        title={workspace.name}
        description={tShell(`types.${workspace.type}`)}
        leading={
          <WorkspaceAvatar
            initials={workspaceInitials(workspace.name)}
            color={workspace.color}
            size="lg"
          />
        }
      />
      <EmptyState
        icon={<Construction />}
        title={tPages("comingSoon")}
        description={tPages("comingSoonDescription")}
      />
    </>
  );
}
