"use client";

import { Alert, Button, FormField, Input, PasswordInput } from "@kaname/ui";
import { registerSchema } from "@kaname/shared";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { applyApiError, useZodForm } from "@/components/use-zod-form";
import { readApiError } from "@/lib/api/errors";

// Registro (solo si la API tiene REGISTRATION_ENABLED=true). Crea la cuenta e inicia la sesión.
export function RegisterForm({ next }: { next: string }) {
  const t = useTranslations("Auth");
  const router = useRouter();
  const { form, fieldError, formError } = useZodForm(registerSchema, {
    name: "",
    email: "",
    password: "",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      if (response.ok) {
        router.replace(next);
        router.refresh();
        return;
      }
      applyApiError(
        form,
        await readApiError(response),
        ["name", "email", "password"],
        { email_taken: "email" },
      );
    } catch {
      form.setError("root.server", { message: "unknown" });
    }
  });

  return (
    <form
      onSubmit={(event) => void onSubmit(event)}
      noValidate
      className="flex flex-col gap-5"
    >
      {formError && <Alert variant="destructive">{formError}</Alert>}
      <FormField label={t("name")} error={fieldError("name")} required>
        <Input {...form.register("name")} autoComplete="name" autoFocus />
      </FormField>
      <FormField label={t("email")} error={fieldError("email")} required>
        <Input
          {...form.register("email")}
          type="email"
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
        />
      </FormField>
      <FormField
        label={t("password")}
        description={t("passwordHelp")}
        error={fieldError("password")}
        required
      >
        <PasswordInput
          {...form.register("password")}
          autoComplete="new-password"
          showLabel={t("showPassword")}
          hideLabel={t("hidePassword")}
        />
      </FormField>
      <Button
        type="submit"
        size="lg"
        loading={form.formState.isSubmitting}
        className="w-full"
      >
        {t("createAccount")}
      </Button>
    </form>
  );
}
