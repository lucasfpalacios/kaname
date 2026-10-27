import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { AuthCard } from "../auth-card";
import { ForgotForm } from "./forgot-form";

// /forgot-password: se abre con o sin sesión (ver OPEN_PATHS en lib/auth/constants.ts).
export default async function ForgotPasswordPage({
  params,
}: PageProps<"/[locale]/forgot-password">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("Auth");

  return (
    <AuthCard
      product={t("product")}
      title={t("forgotTitle")}
      subtitle={t("forgotDescription")}
      footer={
        <Link
          href="/login"
          className="font-medium text-primary hover:underline"
        >
          {t("backToLogin")}
        </Link>
      }
    >
      <ForgotForm />
    </AuthCard>
  );
}
