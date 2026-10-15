"use client";

import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";
import { controlBase } from "../../lib/control";
import { useFormFieldProps } from "../../lib/form-field-context";

// Adaptado de shadcn/ui.
export function Input({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(controlBase, className)}
      {...useFormFieldProps(props)}
    />
  );
}
