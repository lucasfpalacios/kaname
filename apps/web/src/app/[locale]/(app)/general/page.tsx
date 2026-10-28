import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  PageHeader,
  WorkspaceSummaryCard,
} from "@kaname/ui";
import type { WorkspaceSummary } from "@kaname/shared";
import { ArrowRight, ChartNoAxesColumn } from "lucide-react";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getWorkspaces } from "@/lib/api/server";
import { workspaceInitials, workspacePath } from "@/lib/workspaces/modules";
import { UpcomingEvents } from "../upcoming-events";

// Vista General: lo consolidado de todos los espacios. Por ahora, lo que ya existe: cada espacio
// con su tipo, mi rol y sus módulos activos. Las métricas, la comparación y los eventos muestran
// "Todavía no hay datos" hasta que existan los módulos que los generan (sin números inventados).
export default async function GeneralPage({
  params,
}: PageProps<"/[locale]/general">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const [t, tShell, tModules, tRoles, tHome, workspaces] = await Promise.all([
    getTranslations("Pages"),
    getTranslations("Shell"),
    getTranslations("Modules"),
    getTranslations("Roles"),
    getTranslations("Home"),
    getWorkspaces(),
  ]);
  // Los roles del sistema se traducen; los custom usan su nombre.
  const roleOf = ({ role }: WorkspaceSummary) =>
    role.systemKey ? tRoles(role.systemKey) : role.name;

  return (
    <>
      <PageHeader
        title={tModules("GENERAL")}
        module="GENERAL"
        description={tHome("workspaceCount", {
          count: workspaces?.length ?? 0,
        })}
      />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="flex flex-col gap-6 xl:col-span-2">
          <section
            aria-labelledby="general-workspaces"
            className="flex flex-col gap-4"
          >
            <h2
              id="general-workspaces"
              className="font-display text-lg font-semibold"
            >
              {t("workspaces")}
            </h2>
            <div className="grid gap-4 lg:grid-cols-2">
              {workspaces?.map((workspace) => (
                <WorkspaceSummaryCard
                  key={workspace.id}
                  name={workspace.name}
                  description={tShell(`types.${workspace.type}`)}
                  role={roleOf(workspace)}
                  initials={workspaceInitials(workspace.name)}
                  color={workspace.color}
                  modulesLabel={t("activeModules")}
                  modules={workspace.modules.map((module) => tModules(module))}
                  metrics={
                    <EmptyState
                      variant="plain"
                      className="py-6"
                      icon={<ChartNoAxesColumn />}
                      title={t("noData")}
                      description={t("noMetricsDescription")}
                    />
                  }
                  action={
                    <Button asChild variant="ghost" size="sm">
                      <Link href={workspacePath(workspace.slug)}>
                        {t("openWorkspace")}
                        <ArrowRight />
                      </Link>
                    </Button>
                  }
                />
              ))}
            </div>
          </section>
          <Card>
            <CardHeader>
              <CardTitle asChild>
                <h2 className="text-lg">{t("comparison")}</h2>
              </CardTitle>
              <CardDescription>{t("generalDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                variant="plain"
                className="py-6"
                icon={<ChartNoAxesColumn />}
                title={t("noData")}
                description={t("noComparisonDescription")}
              />
            </CardContent>
          </Card>
        </div>
        <UpcomingEvents className="self-start" />
      </div>
    </>
  );
}
