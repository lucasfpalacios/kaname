import { formatDate, PageHeader } from "@kaname/ui";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { intlLocale, TIME_ZONE } from "@/i18n/locale";
import { getAccounts, getArchivedWorkspaces } from "@/lib/api/server";
import { ArchivedWorkspaces } from "./archived-workspaces";

// Configuración de la cuenta: por ahora, los espacios archivados de cada cuenta de la que soy
// Dueño, con la opción de restaurarlos. A quien no es Dueño de ninguna cuenta le da 404.
export default async function AccountPage() {
  const locale = await getLocale();
  const [t, accounts] = await Promise.all([
    getTranslations("Account"),
    getAccounts(),
  ]);
  const owned = (accounts ?? []).filter((account) => account.role === "OWNER");
  if (owned.length === 0) notFound();
  const archived = await Promise.all(
    owned.map((account) => getArchivedWorkspaces(account.id)),
  );

  return (
    <>
      <PageHeader
        title={t("title")}
        module="ADMIN"
        description={t("description")}
      />
      {owned.map((account, index) => (
        <ArchivedWorkspaces
          key={account.id}
          accountId={account.id}
          // Con una sola cuenta no hace falta decir de cuál es.
          accountName={owned.length > 1 ? account.name : undefined}
          workspaces={(archived[index] ?? []).map((workspace) => ({
            ...workspace,
            archivedOn: formatDate(workspace.archivedAt, {
              locale: intlLocale[locale],
              timeZone: TIME_ZONE,
            }),
          }))}
        />
      ))}
    </>
  );
}
