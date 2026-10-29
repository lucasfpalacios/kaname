"use client";

import { Button, EmptyState } from "@kaname/ui";
import { CloudOff, RotateCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { useRouter } from "@/i18n/navigation";

// En lugar de la página cuando no se pudieron cargar los espacios (la API no responde o devolvió
// un error): no es lo mismo que no tener espacios. Reintentar vuelve a pedir los datos del
// servidor sin recargar la página.
export function LoadError() {
  const t = useTranslations("LoadError");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <EmptyState
      icon={<CloudOff />}
      title={t("title")}
      description={t("description")}
      action={
        <Button
          variant="secondary"
          aria-busy={pending || undefined}
          disabled={pending}
          onClick={() => startTransition(() => router.refresh())}
        >
          <RotateCw />
          {t("retry")}
        </Button>
      }
    />
  );
}
