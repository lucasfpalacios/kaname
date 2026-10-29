"use client";

import { Alert, Button, FormField, Input, PasswordInput } from "@kaname/ui";
import { ArrowRight } from "lucide-react";
import { loginSchema } from "@kaname/shared";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { readApiError } from "@/lib/api/errors";
import { applyApiError, useZodForm } from "@/components/use-zod-form";

// Formulario de login. Postea a /api/auth/login (Next lo reenvía a la API), que deja las cookies
// de sesión, y vuelve a la página que se había pedido (`next`).
export function LoginForm({ next }: { next: string }) {
  const t = useTranslations("Auth");
  const router = useRouter();
  const { form, fieldError, formError } = useZodForm(loginSchema, {
    email: "",
    password: "",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      if (response.ok) {
        router.replace(next);
        router.refresh();
        return;
      }
      applyApiError(form, await readApiError(response), ["email", "password"]);
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
      <FormField label={t("email")} error={fieldError("email")} required>
        <Input
          {...form.register("email")}
          type="email"
          autoComplete="username"
          placeholder={t("emailPlaceholder")}
          autoFocus
        />
      </FormField>
      <FormField label={t("password")} error={fieldError("password")} required>
        <PasswordInput
          {...form.register("password")}
          autoComplete="current-password"
          showLabel={t("showPassword")}
          hideLabel={t("hidePassword")}
        />
      </FormField>
      <Link
        href="/forgot-password"
        className="-mt-3 self-end rounded-sm text-sm font-medium text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
      >
        {t("forgotPassword")}
      </Link>
      <Button
        type="submit"
        size="lg"
        loading={form.formState.isSubmitting}
        className="w-full"
      >
        {t("signIn")}
        <ArrowRight />
      </Button>
    </form>
  );
}
