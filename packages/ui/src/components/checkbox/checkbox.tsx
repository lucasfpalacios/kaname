"use client";

import { Check, Minus } from "lucide-react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";
import { useFormFieldProps } from "../../lib/form-field-context";
import { focusRing } from "../../lib/focus-ring";

// Adaptado de shadcn/ui. Acepta checked="indeterminate" (por ejemplo, "seleccionar todo").
export function Checkbox({
  className,
  ...props
}: ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer size-4 shrink-0 cursor-pointer rounded-[4px] border border-foreground/40 bg-card transition-colors",
        "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        "data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground",
        "disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
        focusRing,
        className,
      )}
      {...useFormFieldProps(props)}
    >
      <CheckboxPrimitive.Indicator className="group flex items-center justify-center">
        <Check
          aria-hidden="true"
          strokeWidth={3}
          className="size-3 group-data-[state=indeterminate]:hidden"
        />
        <Minus
          aria-hidden="true"
          strokeWidth={3}
          className="hidden size-3 group-data-[state=indeterminate]:block"
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
