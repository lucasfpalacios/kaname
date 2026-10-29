import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import Link from "next/link";
import { AuthCard, AuthCardSkeleton } from "../auth-card";
import { ResetForm } from "./reset-form";

// El link trae el token en la URL: esta página no lo manda como Referer a ningún lado.
export const metadata: Metadata = { referrer: "no-referrer" };

// /reset-password?token=...: se abre con o sin sesión (OPEN_PATHS). Al guardar, la API cierra
// todas las sesiones y se vuelve a /login.
export default async function ResetPasswordPage({
  searchParams,
}: PageProps<"/reset-password">) {
  return (
    <Suspense fallback={<AuthCardSkeleton />}>
      <ResetCard searchParams={searchParams} />
    </Suspense>
  );
}

async function ResetCard({
  searchParams,
}: {
  searchParams: PageProps<"/reset-password">["searchParams"];
}) {
  const t = await getTranslations("Auth");
  const { token } = await searchParams;
  return (
    <AuthCard
      product={t("product")}
      title={t("resetTitle")}
      subtitle={t("resetDescription")}
      footer={
        <Link
          href="/login"
          className="font-medium text-primary hover:underline"
        >
          {t("backToLogin")}
        </Link>
      }
    >
      <ResetForm token={typeof token === "string" ? token : ""} />
    </AuthCard>
  );
}
