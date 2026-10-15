"use client";

import { useState, type FocusEvent } from "react";
import {
  formatDecimal,
  parseDecimalText,
  toDraft,
  type DecimalTextOptions,
} from "./decimal-text";

type Options = DecimalTextOptions & {
  value: string | null;
  onValueChange: (value: string | null) => void;
  locale: string;
  fractionDigits: { min: number; max: number };
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
};

// Estado compartido de MoneyInput y PercentInput. Mientras el campo tiene foco se edita un
// borrador sin separador de miles; al salir se muestra el valor formateado.
export function useDecimalInput({
  value,
  onValueChange,
  locale,
  fractionDigits,
  onFocus,
  onBlur,
  ...parseOptions
}: Options) {
  const [draft, setDraft] = useState<string | null>(null);

  return {
    inputMode: "decimal" as const,
    autoComplete: "off",
    value: draft ?? formatDecimal(value, locale, fractionDigits),
    onFocus: (event: FocusEvent<HTMLInputElement>) => {
      setDraft(toDraft(value, locale));
      onFocus?.(event);
    },
    onChange: (event: { target: { value: string } }) => {
      const parsed = parseDecimalText(event.target.value, locale, parseOptions);
      setDraft(parsed.draft);
      if (parsed.value !== value) onValueChange(parsed.value);
    },
    onBlur: (event: FocusEvent<HTMLInputElement>) => {
      setDraft(null);
      onBlur?.(event);
    },
  };
}
