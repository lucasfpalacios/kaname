import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { getAuthOptions } from "@/lib/api/server";
import { AuthCard, AuthCardSkeleton } from "../auth-card";
import { RegisterForm } from "./register-form";

// /register: existe solo si la API tiene el registro abierto (REGISTRATION_ENABLED=true).
export default async function RegisterPage() {
  return (
    <Suspense fallback={<AuthCardSkeleton />}>
      <RegisterCard />
    </Suspense>
  );
}

async function RegisterCard() {
  const { registrationEnabled } = await getAuthOptions();
  if (!registrationEnabled) notFound();
  const t = await getTranslations("Auth");

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
      <RegisterForm next="/" />
    </AuthCard>
  );
}
