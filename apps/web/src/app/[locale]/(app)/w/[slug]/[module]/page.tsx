import { PageHeader } from "@kaname/ui";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { getWorkspaceBySlug } from "@/lib/api/server";
import { moduleFromSegment } from "@/lib/workspaces/modules";
import { ModulePlaceholder } from "../module-placeholder";

// Un módulo del espacio (/w/[slug]/products...). Solo los módulos activos del espacio; uno apagado
// o inexistente da 404, igual que en la API. Hasta que se construye, muestra qué va a hacer y en
// qué fase llega (ModulePlaceholder); cada módulo reemplaza esta página en su fase.
export default async function ModulePage({
  params,
}: PageProps<"/[locale]/w/[slug]/[module]">) {
  const { slug, module: segment } = await params;
  const [workspace, tModules] = await Promise.all([
    getWorkspaceBySlug(slug),
    getTranslations("Modules"),
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
      <ModulePlaceholder module={moduleKey} />
    </>
  );
}
