"use client";

import { Alert, Button, FormField, PasswordInput } from "@kaname/ui";
import { resetPasswordSchema } from "@kaname/shared";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useErrorMessage } from "@/components/use-error-message";
import { useLoginPath } from "@/components/use-login-path";
import { applyApiError, useZodForm } from "@/components/use-zod-form";
import { Link } from "@/i18n/navigation";
import { readApiError } from "@/lib/api/errors";

// Contraseña nueva con el token del link. Al cargar, el token sale de la barra de direcciones
// (queda solo en memoria) para que no quede en el historial ni se comparta por error.
// Solo la contraseña: el token no es un campo, viaja aparte.
const passwordSchema = z.object({
  password: resetPasswordSchema.shape.password,
});

export function ResetForm({ token }: { token: string }) {
  const t = useTranslations("Auth");
  const errorMessage = useErrorMessage();
  const router = useRouter();
  const loginPath = useLoginPath();
  const [tokenInvalid, setTokenInvalid] = useState(!token);
  const { form, fieldError, formError } = useZodForm(passwordSchema, {
    password: "",
  });

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.has("token")) {
      url.searchParams.delete("token");
      window.history.replaceState(null, "", url.pathname + url.search);
    }
  }, []);

  const onSubmit = form.handleSubmit(async ({ password }) => {
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (response.ok) {
        router.replace(`${loginPath()}?reset=1`);
        return;
      }
      const error = await readApiError(response);
      if (
        error.code === "reset_token_invalid" ||
        error.issues.some((item) => item.path === "token")
      ) {
        setTokenInvalid(true);
      } else {
        applyApiError(form, error, ["password"]);
      }
    } catch {
      form.setError("root.server", { message: "unknown" });
    }
  });

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
    <form
      onSubmit={(event) => void onSubmit(event)}
      noValidate
      className="flex flex-col gap-5"
    >
      {formError && <Alert variant="destructive">{formError}</Alert>}
      <FormField
        label={t("newPassword")}
        description={t("passwordHelp")}
        error={fieldError("password")}
        required
      >
        <PasswordInput
          {...form.register("password")}
          autoComplete="new-password"
          showLabel={t("showPassword")}
          hideLabel={t("hidePassword")}
          autoFocus
        />
      </FormField>
      <Button
        type="submit"
        size="lg"
        loading={form.formState.isSubmitting}
        className="w-full"
      >
        {t("saveNewPassword")}
      </Button>
    </form>
  );
}
