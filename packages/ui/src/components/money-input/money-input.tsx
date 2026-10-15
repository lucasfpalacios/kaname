"use client";

import { useId, type ComponentProps } from "react";
import { cn } from "../../lib/cn";
import { controlGroup, controlGroupInput } from "../../lib/control";
import type { MoneyCurrency } from "../../lib/format";
import {
  FormFieldContext,
  useFormFieldProps,
} from "../../lib/form-field-context";
import { useDecimalInput } from "../../lib/use-decimal-input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../select";

const CURRENCIES: MoneyCurrency[] = ["ARS", "USD"];

export type MoneyInputProps = Omit<
  ComponentProps<"input">,
  "value" | "defaultValue" | "onChange" | "type" | "inputMode"
> & {
  /** Monto como string decimal ("1234.5"), el mismo formato que moneySchema. */
  value: string | null;
  onValueChange: (value: string | null) => void;
  currency: MoneyCurrency;
  /** Si se pasa, la moneda se puede cambiar desde el campo. */
  onCurrencyChange?: (currency: MoneyCurrency) => void;
  /** Nombre accesible del selector de moneda (por ejemplo "Moneda"). */
  currencyLabel?: string;
  /** Locale para formatear. Por defecto es-AR: 1.234,50. */
  locale?: string;
  allowNegative?: boolean;
};

// Hasta 12 enteros y 2 decimales, como Decimal(14, 2) en la base.
export function MoneyInput(rawProps: MoneyInputProps) {
  const {
    value,
    onValueChange,
    currency,
    onCurrencyChange,
    currencyLabel,
    locale = "es-AR",
    allowNegative = false,
    className,
    onFocus,
    onBlur,
    disabled,
    "aria-describedby": describedBy,
    ...props
  } = useFormFieldProps(rawProps);
  const currencyId = useId();
  const decimalProps = useDecimalInput({
    value,
    onValueChange,
    locale,
    fractionDigits: { min: 2, max: 2 },
    maxIntegerDigits: 12,
    maxDecimals: 2,
    allowNegative,
    onFocus,
    onBlur,
  });

  return (
    <div data-slot="money-input" className={cn(controlGroup, className)}>
      {onCurrencyChange ? (
        // El selector de moneda no es el control del FormField: no hereda su id ni su label.
        <FormFieldContext.Provider value={null}>
          <Select
            value={currency}
            onValueChange={(next) => onCurrencyChange(next as MoneyCurrency)}
            disabled={disabled}
          >
            <SelectTrigger
              id={currencyId}
              aria-label={currencyLabel}
              className="h-full w-auto shrink-0 gap-1 rounded-none border-0 border-r border-border bg-transparent px-3 font-medium focus-visible:ring-0 focus-visible:ring-offset-0"
            >
              {currency}
            </SelectTrigger>
            <SelectContent className="min-w-24">
              {CURRENCIES.map((code) => (
                <SelectItem key={code} value={code}>
                  {code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormFieldContext.Provider>
      ) : (
        <span
          id={currencyId}
          className="shrink-0 border-r border-border px-3 font-medium opacity-70"
        >
          {currency}
        </span>
      )}
      <input
        data-slot="money-input-field"
        className={cn(controlGroupInput, "text-right tabular-nums")}
        disabled={disabled}
        aria-describedby={[describedBy, currencyId].filter(Boolean).join(" ")}
        {...props}
        {...decimalProps}
      />
    </div>
  );
}
