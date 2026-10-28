import { EmptyState, PageHeader } from "@kaname/ui";
import { LayoutGrid } from "lucide-react";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getCurrentUser, getWorkspaces } from "@/lib/api/server";

// Inicio. El launcher con los espacios llega en el paso siguiente de la Fase 2.
export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const [t, user, workspaces] = await Promise.all([
    getTranslations("Home"),
    getCurrentUser(),
    getWorkspaces(),
  ]);

  return (
    <>
      <PageHeader
        title={t("greeting", { name: user?.name.split(" ")[0] ?? "" })}
        description={t("workspaceCount", { count: workspaces?.length ?? 0 })}
      />
      <EmptyState icon={<LayoutGrid />} title={t("launcherSoon")} />
    </>
  );
}
