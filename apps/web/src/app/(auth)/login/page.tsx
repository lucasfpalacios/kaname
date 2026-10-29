import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import Link from "next/link";
import { Alert, GoogleButton, LabeledSeparator } from "@kaname/ui";
import { getAuthOptions } from "@/lib/api/server";
import { safeNextPath } from "@/lib/auth/next-path";
import { AuthCard, AuthCardSkeleton } from "../auth-card";
import { LoginForm } from "./login-form";

// /login. Si ya hay sesión, el proxy redirige antes de llegar acá. "Continuar con Google" navega
// a la API (/api/auth/google); si el login con Google falla, la API vuelve acá con ?error=<código>.
export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <Suspense fallback={<AuthCardSkeleton />}>
      <LoginCard searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginCard({
  searchParams,
}: {
  searchParams: PageProps<"/login">["searchParams"];
}) {
  const t = await getTranslations("Auth");
  const errors = await getTranslations("Errors");
  const { next, reset, error } = await searchParams;
  const destination = safeNextPath(typeof next === "string" ? next : null, "/");
  const { registrationEnabled, googleEnabled } = await getAuthOptions();
  // Solo códigos conocidos: el texto sale siempre de las traducciones, nunca de la URL.
  const errorKey = error as Parameters<typeof errors>[0];
  const googleError =
    typeof error === "string" && errors.has(errorKey) ? errors(errorKey) : null;
  const googleUrl = `/api/auth/google?${new URLSearchParams({ next: destination })}`;

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
      {reset === "1" && <Alert variant="success">{t("resetDone")}</Alert>}
      {googleError && <Alert variant="destructive">{googleError}</Alert>}
      <LoginForm next={destination} />
      {googleEnabled && (
        <div className="-mt-3 flex flex-col gap-5">
          <LabeledSeparator>{t("or")}</LabeledSeparator>
          <GoogleButton href={googleUrl} label={t("continueWithGoogle")} />
        </div>
      )}
    </AuthCard>
  );
}
