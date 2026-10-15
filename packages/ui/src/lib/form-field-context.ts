"use client";

import { createContext, useContext } from "react";

// FormField publica los ids de su label, ayuda y error, y cada control los toma con
// useFormFieldProps. Funciona aunque el control esté anidado (por ejemplo SelectTrigger dentro
// de Select), cosa que no se puede con un Slot.
export type FormFieldContextValue = {
  id: string;
  labelId: string;
  describedBy?: string;
  invalid: boolean;
  required: boolean;
};

export const FormFieldContext = createContext<FormFieldContextValue | null>(
  null,
);

type FieldA11yProps = {
  id?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false" | "grammar" | "spelling";
  "aria-required"?: boolean | "true" | "false";
};

// Completa los props de accesibilidad con los del FormField. Los que pasa el consumidor ganan,
// salvo aria-describedby, que se suma.
export function useFormFieldProps<P extends FieldA11yProps>(props: P): P {
  const field = useContext(FormFieldContext);
  if (!field) return props;
  const describedBy =
    [field.describedBy, props["aria-describedby"]].filter(Boolean).join(" ") ||
    undefined;
  return {
    ...props,
    id: props.id ?? field.id,
    "aria-labelledby": props["aria-labelledby"] ?? field.labelId,
    "aria-describedby": describedBy,
    "aria-invalid": props["aria-invalid"] ?? (field.invalid || undefined),
    "aria-required": props["aria-required"] ?? (field.required || undefined),
  };
}
