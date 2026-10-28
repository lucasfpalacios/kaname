import { EmptyState, PageHeader } from "@kaname/ui";
import { Construction } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { getWorkspaceBySlug } from "@/lib/api/server";
import { moduleFromSegment } from "@/lib/workspaces/modules";

// Un módulo del espacio (/w/[slug]/products...). Solo los módulos activos del espacio; uno apagado
// o inexistente da 404, igual que en la API. Cada módulo reemplaza esta página en su fase.
export default async function ModulePage({
  params,
}: PageProps<"/[locale]/w/[slug]/[module]">) {
  const { slug, module: segment } = await params;
  const [workspace, tModules, tPages] = await Promise.all([
    getWorkspaceBySlug(slug),
    getTranslations("Modules"),
    getTranslations("Pages"),
  ]);
  const moduleKey = moduleFromSegment(segment);
  if (!workspace || !moduleKey || !workspace.modules.includes(moduleKey))
    notFound();
  return (
    <>
      <PageHeader
        title={tModules(moduleKey)}
        module={moduleKey}
        description={workspace.name}
      />
      <EmptyState
        icon={<Construction />}
        title={tPages("comingSoon")}
        description={tPages("comingSoonDescription")}
      />
    </>
  );
}
