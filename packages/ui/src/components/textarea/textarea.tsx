"use client";

import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";
import { controlBase } from "../../lib/control";
import { useFormFieldProps } from "../../lib/form-field-context";

// Adaptado de shadcn/ui. Crece con el contenido (field-sizing) desde una altura mínima.
export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        controlBase,
        "field-sizing-content h-auto min-h-20 items-start py-2",
        className,
      )}
      {...useFormFieldProps(props)}
    />
  );
}
