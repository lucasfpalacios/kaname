// Montos y porcentajes como string decimal canónico ("1234.5"), nunca como number, igual que
// moneySchema en @kaname/shared. Estas funciones convierten entre ese valor y el texto que ve
// el usuario según el locale (es-AR: "1.234,50").

export type DecimalTextOptions = {
  maxIntegerDigits: number;
  maxDecimals: number;
  allowNegative?: boolean;
};

export type ParsedDecimalText = {
  /** Lo que queda en el input mientras se escribe, sin separador de miles. */
  draft: string;
  /** Valor canónico ("1234.5", "-3") o null si el campo quedó vacío. */
  value: string | null;
};

export function decimalSeparator(locale: string) {
  return (
    new Intl.NumberFormat(locale)
      .formatToParts(1.5)
      .find((part) => part.type === "decimal")?.value ?? "."
  );
}

// Interpreta lo que escribió o pegó el usuario. El último "." o "," es el separador decimal y los
// anteriores se descartan como separadores de miles. Así "1.234,56" (pegado) da 1234.56 y un "."
// del teclado numérico funciona como coma. Los dígitos que superan el máximo se ignoran.
export function parseDecimalText(
  text: string,
  locale: string,
  { maxIntegerDigits, maxDecimals, allowNegative = false }: DecimalTextOptions,
): ParsedDecimalText {
  const negative = allowNegative && text.trimStart().startsWith("-");
  const cleaned = text.replace(/[^\d.,]/g, "");
  const lastSeparator = Math.max(
    cleaned.lastIndexOf("."),
    cleaned.lastIndexOf(","),
  );
  const hasDecimal = maxDecimals > 0 && lastSeparator !== -1;

  const integerDigits = (hasDecimal ? cleaned.slice(0, lastSeparator) : cleaned)
    .replace(/\D/g, "")
    .replace(/^0+(?=\d)/, "")
    .slice(0, maxIntegerDigits);
  const decimalDigits = hasDecimal
    ? cleaned
        .slice(lastSeparator + 1)
        .replace(/\D/g, "")
        .slice(0, maxDecimals)
    : "";

  const sign = negative ? "-" : "";
  const draft =
    sign +
    integerDigits +
    (hasDecimal ? decimalSeparator(locale) + decimalDigits : "");

  if (!integerDigits && !decimalDigits) return { draft, value: null };
  const value =
    sign + (integerDigits || "0") + (decimalDigits ? `.${decimalDigits}` : "");
  return { draft, value: value === "-0" ? "0" : value };
}

// Texto para editar un valor canónico: sin miles y con el separador decimal del locale.
export function toDraft(value: string | null, locale: string) {
  return value === null ? "" : value.replace(".", decimalSeparator(locale));
}

// Texto final con separador de miles. Intl formatea el string sin pasarlo a number, así no se
// pierde precisión.
export function formatDecimal(
  value: string | null,
  locale: string,
  fractionDigits: { min: number; max: number },
) {
  if (value === null) return "";
  return new Intl.NumberFormat(locale, {
    useGrouping: "always",
    minimumFractionDigits: fractionDigits.min,
    maximumFractionDigits: fractionDigits.max,
  }).format(value as Intl.StringNumericLiteral);
}
