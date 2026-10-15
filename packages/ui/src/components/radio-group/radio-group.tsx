"use client";

import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";
import { useFormFieldProps } from "../../lib/form-field-context";
import { focusRing } from "../../lib/focus-ring";

// Adaptado de shadcn/ui.
export function RadioGroup({
  className,
  ...props
}: ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("group/radio-group grid gap-3", className)}
      {...useFormFieldProps(props)}
    />
  );
}

export function RadioGroupItem({
  className,
  ...props
}: ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "peer aspect-square size-4 shrink-0 cursor-pointer rounded-full border border-foreground/40 bg-card transition-colors data-[state=checked]:border-primary",
        "disabled:cursor-not-allowed disabled:opacity-50 group-aria-invalid/radio-group:border-destructive",
        focusRing,
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <span className="size-2 rounded-full bg-primary" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}
