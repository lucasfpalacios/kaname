import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getAuthOptions } from "@/lib/api/server";
import { AuthCard, AuthCardSkeleton } from "../auth-card";
import { RegisterForm } from "./register-form";

// /register: existe solo si la API tiene el registro abierto (REGISTRATION_ENABLED=true).
export default async function RegisterPage({
  params,
}: PageProps<"/[locale]/register">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <Suspense fallback={<AuthCardSkeleton />}>
      <RegisterCard locale={locale} />
    </Suspense>
  );
}

async function RegisterCard({ locale }: { locale: string }) {
  const { registrationEnabled } = await getAuthOptions();
  if (!registrationEnabled) notFound();
  const t = await getTranslations("Auth");
  const home = locale === routing.defaultLocale ? "/" : `/${locale}`;

  return (
    <AuthCard
      product={t("product")}
      title={t("registerTitle")}
      subtitle={t("tagline")}
      footer={
        <>
          {t("haveAccount")}{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            {t("signInLink")}
          </Link>
        </>
      }
    >
      <RegisterForm next={home} />
    </AuthCard>
  );
}
