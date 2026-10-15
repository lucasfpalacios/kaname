"use client";

import { useId, type ComponentProps } from "react";
import { cn } from "../../lib/cn";
import { controlGroup, controlGroupInput } from "../../lib/control";
import { useFormFieldProps } from "../../lib/form-field-context";
import { useDecimalInput } from "../../lib/use-decimal-input";

export type PercentInputProps = Omit<
  ComponentProps<"input">,
  "value" | "defaultValue" | "onChange" | "type" | "inputMode"
> & {
  /** Porcentaje como string decimal: "21" es 21 %, "12.5" es 12,5 %. */
  value: string | null;
  onValueChange: (value: string | null) => void;
  locale?: string;
  /** Enteros permitidos. Por defecto 4 (hasta 9999 %, para markups altos). */
  maxIntegerDigits?: number;
  allowNegative?: boolean;
};

export function PercentInput(rawProps: PercentInputProps) {
  const {
    value,
    onValueChange,
    locale = "es-AR",
    maxIntegerDigits = 4,
    allowNegative = false,
    className,
    onFocus,
    onBlur,
    "aria-describedby": describedBy,
    ...props
  } = useFormFieldProps(rawProps);
  const suffixId = useId();
  const decimalProps = useDecimalInput({
    value,
    onValueChange,
    locale,
    fractionDigits: { min: 0, max: 2 },
    maxIntegerDigits,
    maxDecimals: 2,
    allowNegative,
    onFocus,
    onBlur,
  });

  return (
    <div data-slot="percent-input" className={cn(controlGroup, className)}>
      <input
        data-slot="percent-input-field"
        className={cn(controlGroupInput, "pr-1 text-right tabular-nums")}
        aria-describedby={[describedBy, suffixId].filter(Boolean).join(" ")}
        {...props}
        {...decimalProps}
      />
      <span id={suffixId} className="shrink-0 pr-3 opacity-70">
        %
      </span>
    </div>
  );
}
