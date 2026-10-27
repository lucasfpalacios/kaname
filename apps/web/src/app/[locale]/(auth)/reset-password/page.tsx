import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { AuthCard, AuthCardSkeleton } from "../auth-card";
import { ResetForm } from "./reset-form";

// El link trae el token en la URL: esta página no lo manda como Referer a ningún lado.
export const metadata: Metadata = { referrer: "no-referrer" };

// /reset-password?token=...: se abre con o sin sesión (OPEN_PATHS). Al guardar, la API cierra
// todas las sesiones y se vuelve a /login.
export default async function ResetPasswordPage({
  params,
  searchParams,
}: PageProps<"/[locale]/reset-password">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <Suspense fallback={<AuthCardSkeleton />}>
      <ResetCard searchParams={searchParams} />
    </Suspense>
  );
}

async function ResetCard({
  searchParams,
}: {
  searchParams: PageProps<"/[locale]/reset-password">["searchParams"];
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
