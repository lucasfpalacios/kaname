import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { AuthCard } from "../auth-card";
import { ForgotForm } from "./forgot-form";

// /forgot-password: se abre con o sin sesión (ver OPEN_PATHS en lib/auth/constants.ts).
export default async function ForgotPasswordPage() {
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
