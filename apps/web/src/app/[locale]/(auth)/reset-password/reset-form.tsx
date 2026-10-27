"use client";

import { Alert, Button, FormField, PasswordInput } from "@kaname/ui";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { useErrorMessage } from "@/components/use-error-message";
import { useLoginPath } from "@/components/use-login-path";
import { Link } from "@/i18n/navigation";
import { readApiError } from "@/lib/api/errors";

// Contraseña nueva con el token del link. Al cargar, el token sale de la barra de direcciones
// (queda solo en memoria) para que no quede en el historial ni se comparta por error.
export function ResetForm({ token }: { token: string }) {
  const t = useTranslations("Auth");
  const errorMessage = useErrorMessage();
  const router = useRouter();
  const loginPath = useLoginPath();
  const [pending, setPending] = useState(false);
  const [tokenInvalid, setTokenInvalid] = useState(!token);
  const [formError, setFormError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string>();

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.has("token")) {
      url.searchParams.delete("token");
      window.history.replaceState(null, "", url.pathname + url.search);
    }
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setFormError(null);
    setPasswordError(undefined);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, password: form.get("password") }),
      });
      if (response.ok) {
        router.replace(`${loginPath()}?reset=1`);
        return;
      }
      const error = await readApiError(response);
      const passwordIssue = error.issues.find(
        (item) => item.path === "password",
      );
      if (
        error.code === "reset_token_invalid" ||
        error.issues.some((item) => item.path === "token")
      ) {
        setTokenInvalid(true);
      } else if (passwordIssue) {
        setPasswordError(errorMessage(passwordIssue.code));
      } else {
        setFormError(errorMessage(error.code));
      }
    } catch {
      setFormError(t("genericError"));
    }
    setPending(false);
  }

  if (tokenInvalid) {
    return (
      <div className="flex flex-col gap-5">
        <Alert variant="destructive">
          {errorMessage("reset_token_invalid")}
        </Alert>
        <Button asChild size="lg" variant="secondary" className="w-full">
          <Link href="/forgot-password">{t("requestNewLink")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {formError && <Alert variant="destructive">{formError}</Alert>}
      <FormField
        label={t("newPassword")}
        description={t("passwordHelp")}
        error={passwordError}
        required
      >
        <PasswordInput
          name="password"
          autoComplete="new-password"
          showLabel={t("showPassword")}
          hideLabel={t("hidePassword")}
          autoFocus
        />
      </FormField>
      <Button type="submit" size="lg" loading={pending} className="w-full">
        {t("saveNewPassword")}
      </Button>
    </form>
  );
}
