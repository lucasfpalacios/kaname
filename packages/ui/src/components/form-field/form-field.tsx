"use client";

import { useId, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import { FormFieldContext } from "../../lib/form-field-context";
import { Label } from "../label";

export type FormFieldProps = {
  label: ReactNode;
  /** Texto de ayuda debajo del campo. */
  description?: ReactNode;
  /** Mensaje de error ya traducido. Si hay error, el campo queda con aria-invalid. */
  error?: ReactNode;
  required?: boolean;
  /** Id del control. Si no se pasa, se genera uno. */
  id?: string;
  className?: string;
  /** El control: Input, Select, Combobox, DatePicker, MoneyInput, RadioGroup... */
  children: ReactNode;
};

// Arma label, ayuda y error alrededor de un control. Los controles del kit toman de acá su id,
// aria-labelledby, aria-describedby, aria-invalid y aria-required, así cada campo queda
// accesible sin cablearlo a mano.
export function FormField({
  label,
  description,
  error,
  required = false,
  id,
  className,
  children,
}: FormFieldProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const labelId = `${controlId}-label`;
  const descriptionId = `${controlId}-description`;
  const errorId = `${controlId}-error`;
  const hasError = Boolean(error);
  const describedBy =
    [description && descriptionId, hasError && errorId]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div
      data-slot="form-field"
      className={cn("flex flex-col gap-2", className)}
    >
      <Label id={labelId} htmlFor={controlId}>
        {label}
        {required && (
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
        )}
      </Label>
      <FormFieldContext.Provider
        value={{
          id: controlId,
          labelId,
          describedBy,
          invalid: hasError,
          required,
        }}
      >
        {children}
      </FormFieldContext.Provider>
      {description && (
        <p id={descriptionId} className="text-xs text-foreground/70">
          {description}
        </p>
      )}
      {hasError && (
        <p id={errorId} className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
