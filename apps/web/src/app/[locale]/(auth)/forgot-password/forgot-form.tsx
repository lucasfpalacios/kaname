"use client";

import { Alert, Button, FormField, Input } from "@kaname/ui";
import { forgotPasswordSchema } from "@kaname/shared";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { applyApiError, useZodForm } from "@/components/use-zod-form";
import { readApiError } from "@/lib/api/errors";

// Pide el link de recuperación. La API responde lo mismo exista o no el email, y acá se muestra
// el mismo mensaje en los dos casos.
export function ForgotForm() {
  const t = useTranslations("Auth");
  const [sent, setSent] = useState(false);
  const { form, fieldError, formError } = useZodForm(forgotPasswordSchema, {
    email: "",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      if (response.ok) setSent(true);
      else applyApiError(form, await readApiError(response), ["email"]);
    } catch {
      form.setError("root.server", { message: "unknown" });
    }
  });

  if (sent) return <Alert variant="success">{t("forgotSent")}</Alert>;

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
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
          autoFocus
        />
      </FormField>
      <Button
        type="submit"
        size="lg"
        loading={form.formState.isSubmitting}
        className="w-full"
      >
        {t("sendLink")}
      </Button>
    </form>
  );
}
