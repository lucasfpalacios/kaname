"use client";

import { Alert, Button, FormField, Input } from "@kaname/ui";
import { useTranslations } from "next-intl";
import { type FormEvent, useState } from "react";
import { useErrorMessage } from "@/components/use-error-message";
import { readApiError } from "@/lib/api/errors";

// Pide el link de recuperación. La API responde lo mismo exista o no el email, y acá se muestra
// el mismo mensaje en los dos casos.
export function ForgotForm() {
  const t = useTranslations("Auth");
  const errorMessage = useErrorMessage();
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string>();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setFormError(null);
    setEmailError(undefined);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: form.get("email") }),
      });
      if (response.ok) {
        setSent(true);
      } else {
        const error = await readApiError(response);
        const issue = error.issues.find((item) => item.path === "email");
        if (issue) setEmailError(errorMessage(issue.code));
        else setFormError(errorMessage(error.code));
      }
    } catch {
      setFormError(t("genericError"));
    }
    setPending(false);
  }

  if (sent) return <Alert variant="success">{t("forgotSent")}</Alert>;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {formError && <Alert variant="destructive">{formError}</Alert>}
      <FormField label={t("email")} error={emailError} required>
        <Input
          name="email"
          type="email"
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
          autoFocus
        />
      </FormField>
      <Button type="submit" size="lg" loading={pending} className="w-full">
        {t("sendLink")}
      </Button>
    </form>
  );
}
