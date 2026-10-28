import { EmptyState, PageHeader } from "@kaname/ui";
import { Construction } from "lucide-react";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

// Vista General: lo consolidado de todos los espacios. El contenido llega en la Fase 7.
export default async function GeneralPage({
  params,
}: PageProps<"/[locale]/general">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const [tModules, tPages] = await Promise.all([
    getTranslations("Modules"),
    getTranslations("Pages"),
  ]);
  return (
    <>
      <PageHeader
        title={tModules("GENERAL")}
        module="GENERAL"
        description={tPages("generalDescription")}
      />
      <EmptyState
        icon={<Construction />}
        title={tPages("comingSoon")}
        description={tPages("comingSoonDescription")}
      />
    </>
  );
}
