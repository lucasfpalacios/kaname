import { Button, EmptyState } from "@kaname/ui";
import { SearchX } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

// 404 dentro de la app, con el shell (un espacio que no es mío, un módulo apagado...), en el
// idioma de la URL.
export default async function NotFound() {
  const t = await getTranslations("NotFound");
  return (
    <EmptyState
      icon={<SearchX />}
      title={t("title")}
      description={t("description")}
      action={
        <Button asChild variant="secondary">
          <Link href="/">{t("home")}</Link>
        </Button>
      }
    />
  );
}
