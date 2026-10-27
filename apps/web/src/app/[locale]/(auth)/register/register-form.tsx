"use client";

import { Alert, Button, FormField, Input, PasswordInput } from "@kaname/ui";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { readApiError } from "@/lib/api/errors";
import { useErrorMessage } from "@/components/use-error-message";

// Registro (solo si la API tiene REGISTRATION_ENABLED=true). Crea la cuenta e inicia la sesión.
export function RegisterForm({ next }: { next: string }) {
  const t = useTranslations("Auth");
  const errorMessage = useErrorMessage();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setFormError(null);
    setFieldErrors({});
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form)),
      });
      if (response.ok) {
        router.replace(next);
        router.refresh();
        return;
      }
      const error = await readApiError(response);
      if (error.code === "validation_failed") {
        setFieldErrors(
          Object.fromEntries(
            error.issues.map((issue) => [issue.path, errorMessage(issue.code)]),
          ),
        );
      } else if (error.code === "email_taken") {
        setFieldErrors({ email: errorMessage(error.code) });
      } else {
        setFormError(errorMessage(error.code));
      }
    } catch {
      setFormError(t("genericError"));
    }
    setPending(false);
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {formError && <Alert variant="destructive">{formError}</Alert>}
      <FormField label={t("name")} error={fieldErrors.name} required>
        <Input name="name" autoComplete="name" autoFocus />
      </FormField>
      <FormField label={t("email")} error={fieldErrors.email} required>
        <Input
          name="email"
          type="email"
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
        />
      </FormField>
      <FormField
        label={t("password")}
        description={t("passwordHelp")}
        error={fieldErrors.password}
        required
      >
        <PasswordInput
          name="password"
          autoComplete="new-password"
          showLabel={t("showPassword")}
          hideLabel={t("hidePassword")}
        />
      </FormField>
      <Button type="submit" size="lg" loading={pending} className="w-full">
        {t("createAccount")}
      </Button>
    </form>
  );
}
