import { PageHeader } from "@kaname/ui";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { getWorkspaceBySlug } from "@/lib/api/server";
import { WorkspaceSettings } from "./workspace-settings";

// Configuración del espacio. Solo para el Dueño de la cuenta: a los demás miembros les da 404
// (en el sidebar no ven el link); la API igual rechaza los cambios con 403.
export default async function WorkspaceSettingsPage({
  params,
}: PageProps<"/[locale]/w/[slug]/settings">) {
  const { slug } = await params;
  const [workspace, tShell, t] = await Promise.all([
    getWorkspaceBySlug(slug),
    getTranslations("Shell"),
    getTranslations("Workspace"),
  ]);
  if (!workspace || workspace.accountRole !== "OWNER") notFound();
  return (
    <>
      <PageHeader
        title={tShell("settings")}
        module="ADMIN"
        description={t("settingsDescription")}
      />
      {/* key: al cambiar de espacio (o de slug) el formulario arranca de los datos nuevos. */}
      <WorkspaceSettings key={workspace.id} workspace={workspace} />
    </>
  );
}
