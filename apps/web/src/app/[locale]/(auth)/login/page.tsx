import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getAuthOptions } from "@/lib/api/server";
import { safeNextPath } from "@/lib/auth/next-path";
import { AuthCard, AuthCardSkeleton } from "../auth-card";
import { LoginForm } from "./login-form";

// /login. Si ya hay sesión, el proxy redirige antes de llegar acá. Los links "¿Olvidaste tu
// contraseña?" y "Continuar con Google" llegan en los pasos 4 y 5 de la Fase 1.
export default async function LoginPage({
  params,
  searchParams,
}: PageProps<"/[locale]/login">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <Suspense fallback={<AuthCardSkeleton />}>
      <LoginCard locale={locale} searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginCard({
  locale,
  searchParams,
}: {
  locale: string;
  searchParams: PageProps<"/[locale]/login">["searchParams"];
}) {
  const t = await getTranslations("Auth");
  const { next } = await searchParams;
  const home = locale === routing.defaultLocale ? "/" : `/${locale}`;
  const { registrationEnabled } = await getAuthOptions();

  return (
    <AuthCard
      product={t("product")}
      title={t("product")}
      subtitle={t("tagline")}
      footer={
        registrationEnabled && (
          <>
            {t("noAccount")}{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:underline"
            >
              {t("register")}
            </Link>
          </>
        )
      }
    >
      <LoginForm
        next={safeNextPath(typeof next === "string" ? next : null, home)}
      />
    </AuthCard>
  );
}
