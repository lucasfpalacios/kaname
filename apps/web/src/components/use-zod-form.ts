"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  type DefaultValues,
  type FieldValues,
  type Path,
  type Resolver,
  useForm,
  type UseFormReturn,
} from "react-hook-form";
import type { z } from "zod";
import type { ApiError } from "@/lib/api/errors";
import { useErrorMessage } from "./use-error-message";

type Schema = z.ZodType<FieldValues, FieldValues>;

// Formularios con react-hook-form y los schemas de @kaname/shared (los mismos que valida la API).
// Los mensajes de los schemas son códigos (Errors.<código>); `fieldError` los traduce. Al enviar
// con errores, el foco va al primer campo inválido.
export function useZodForm<S extends Schema>(
  schema: S,
  defaultValues: DefaultValues<z.input<S>>,
) {
  const form = useForm<z.input<S>, unknown, z.output<S>>({
    // zodResolver infiere tipos genéricos con un schema genérico: se le dicen los de este.
    resolver: zodResolver(schema) as unknown as Resolver<
      z.input<S>,
      unknown,
      z.output<S>
    >,
    defaultValues,
    shouldFocusError: true,
  });
  const errorMessage = useErrorMessage();
  const { errors } = form.formState;

  /** Error traducido de un campo, para FormField. */
  const fieldError = (name: Path<z.input<S>>) => {
    const code = form.getFieldState(name, form.formState).error?.message;
    return code ? errorMessage(code) : undefined;
  };

  /** Error general (de la API o de un campo sin control visible), traducido. */
  const formError = errors.root?.server?.message
    ? errorMessage(errors.root.server.message)
    : null;

  return { form, fieldError, formError };
}

/**
 * Pasa un error de la API al formulario. Cada problema de un campo que se ve va a ese campo (y el
 * foco al primero); los de campos que no se ven, o un error sin campo, quedan como error general.
 * `byCode` asigna códigos sin campo a uno (por ejemplo, email_taken → email).
 */
export function applyApiError<T extends FieldValues>(
  form: UseFormReturn<T, unknown, FieldValues>,
  error: ApiError,
  fields: readonly Path<T>[],
  byCode: Partial<Record<string, Path<T>>> = {},
) {
  const visible = new Set<string>(fields);
  const issues = [...error.issues];
  const mapped = byCode[error.code];
  if (mapped) issues.unshift({ path: mapped, code: error.code });

  let focused = false;
  let general: string | null = issues.length === 0 ? error.code : null;
  for (const issue of issues) {
    if (!visible.has(issue.path)) {
      general ??= issue.code;
      continue;
    }
    form.setError(
      issue.path as Path<T>,
      { message: issue.code },
      { shouldFocus: !focused },
    );
    focused = true;
  }
  if (general) form.setError("root.server", { message: general });
}
