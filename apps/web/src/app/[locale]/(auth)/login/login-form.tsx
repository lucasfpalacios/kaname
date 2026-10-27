"use client";

import { Alert, Button, FormField, Input, PasswordInput } from "@kaname/ui";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { readApiError } from "@/lib/api/errors";
import { useErrorMessage } from "@/components/use-error-message";

// Formulario de login. Postea a /api/auth/login (Next lo reenvía a la API), que deja las cookies
// de sesión, y vuelve a la página que se había pedido (`next`).
export function LoginForm({ next }: { next: string }) {
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
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
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
      <FormField label={t("email")} error={fieldErrors.email} required>
        <Input
          name="email"
          type="email"
          autoComplete="username"
          placeholder={t("emailPlaceholder")}
          autoFocus
        />
      </FormField>
      <FormField label={t("password")} error={fieldErrors.password} required>
        <PasswordInput
          name="password"
          autoComplete="current-password"
          showLabel={t("showPassword")}
          hideLabel={t("hidePassword")}
        />
      </FormField>
      <Button type="submit" size="lg" loading={pending} className="w-full">
        {t("signIn")}
        <ArrowRight />
      </Button>
    </form>
  );
}
