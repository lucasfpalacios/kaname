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

// Interpreta lo que escribió o pegó el usuario según el locale (es-AR: "." miles y "," decimal;
// en-US al revés). Se ignora todo lo que no sea dígito o separador ("$", espacios, letras).
// - Un separador que aparece más de una vez es de miles: "1.234.567" → 1234567.
// - Si aparecen los dos, el último es el decimal: "1.234,56" y "1,234.56" → 1234.56.
// - El separador decimal del locale, solo, es decimal: "12,5" → 12.5 en es-AR.
// - El del otro locale, solo y una vez: con exactamente 3 dígitos después es miles ("12.000" →
//   12000 en es-AR); con 1 o 2, decimal ("12.5" → 12.5). Sin dígitos después es la tecla "." del
//   teclado numérico mientras se escribe: el borrador pasa a mostrar el separador del locale.
// Los dígitos que superan el máximo se ignoran.
export function parseDecimalText(
  text: string,
  locale: string,
  { maxIntegerDigits, maxDecimals, allowNegative = false }: DecimalTextOptions,
): ParsedDecimalText {
  const negative = allowNegative && /^[^\d]*-/.test(text);
  const cleaned = text.replace(/[^\d.,]/g, "");
  const separator = decimalIndex(cleaned, decimalSeparator(locale));
  const hasDecimal = maxDecimals > 0 && separator !== -1;

  const integerDigits = (hasDecimal ? cleaned.slice(0, separator) : cleaned)
    .replace(/\D/g, "")
    .replace(/^0+(?=\d)/, "")
    .slice(0, maxIntegerDigits);
  const decimalDigits = hasDecimal
    ? cleaned
        .slice(separator + 1)
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

const count = (text: string, char: string) => text.split(char).length - 1;

// Posición del separador decimal en un texto con solo dígitos, "." y ",", o -1 si no hay.
function decimalIndex(text: string, localeDecimal: string) {
  const other = localeDecimal === "," ? "." : ",";
  const decimals = count(text, localeDecimal);
  const others = count(text, other);
  if (decimals > 0 && others > 0) {
    const last =
      text.lastIndexOf(localeDecimal) > text.lastIndexOf(other)
        ? localeDecimal
        : other;
    return count(text, last) === 1 ? text.lastIndexOf(last) : -1;
  }
  if (decimals === 1) return text.indexOf(localeDecimal);
  if (others === 1) {
    const index = text.indexOf(other);
    return text.length - index - 1 === 3 ? -1 : index;
  }
  return -1;
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
