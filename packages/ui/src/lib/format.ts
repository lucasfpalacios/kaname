// Formato de montos, fechas y variaciones según el locale. Los montos entran como string
// decimal ("1234.5"): Intl los formatea sin pasarlos a number, así no se pierde precisión.

// Mismos valores que Currency en @kaname/shared. El kit declara su propio tipo para no depender
// del paquete del dominio (igual que ModuleKanji y los estados de StatusBadge).
export type MoneyCurrency = "ARS" | "USD";

export type MoneyFormatOptions = {
  currency: MoneyCurrency;
  locale?: string;
  /** Sin centavos: $ 4.620.000. */
  hideDecimals?: boolean;
  /** Notación corta para ejes y espacios chicos: $ 4,6 M. */
  compact?: boolean;
};

export function formatMoney(
  value: string | number,
  {
    currency,
    locale = "es-AR",
    hideDecimals = false,
    compact = false,
  }: MoneyFormatOptions,
) {
  const digits = compact
    ? { max: 1, min: 0 }
    : hideDecimals
      ? { max: 0, min: 0 }
      : { max: 2, min: 2 };
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    notation: compact ? "compact" : "standard",
    minimumFractionDigits: digits.min,
    maximumFractionDigits: digits.max,
  }).format(value as Intl.StringNumericLiteral);
}

export type DateFormat =
  "date" | "short" | "long" | "monthYear" | "datetime" | "time";

const DATE_FORMATS: Record<DateFormat, Intl.DateTimeFormatOptions> = {
  date: { day: "2-digit", month: "2-digit", year: "numeric" },
  short: { day: "numeric", month: "short" },
  long: { day: "numeric", month: "long", year: "numeric" },
  monthYear: { month: "long", year: "numeric" },
  datetime: {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  },
  time: { hour: "2-digit", minute: "2-digit" },
};

// ICU formatea es-AR con reloj de 12 h ("10:30 p. m."), pero en Argentina se usa 24 h. Si el
// locale no fija el ciclo (con -u-hc-), en español va h23; el resto usa el de su locale.
function hourCycle(locale: string) {
  const parsed = new Intl.Locale(locale);
  if (parsed.hourCycle) return parsed.hourCycle;
  return parsed.language === "es" ? "h23" : undefined;
}

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** true si el valor es una fecha sin hora ("2026-10-24"). */
export const isDateOnly = (value: Date | string) =>
  typeof value === "string" && DATE_ONLY.test(value);

// Una fecha sin hora ("2026-10-24") es un día del calendario, no un instante: se formatea en UTC
// para que no se corra al día anterior en zonas con offset negativo como Argentina.
export function formatDate(
  value: Date | string,
  {
    locale = "es-AR",
    format = "date",
    timeZone,
  }: { locale?: string; format?: DateFormat; timeZone?: string } = {},
) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(locale, {
    ...DATE_FORMATS[format],
    hourCycle: hourCycle(locale),
    timeZone: isDateOnly(value) ? "UTC" : timeZone,
  }).format(date);
}

/**
 * Variación con signo. Sin `unit` es un porcentaje ("14.2" → +14,2 %); con `unit` es un número
 * seguido de esa unidad ("3.5", "pp" → +3,5 pp).
 */
export function formatChange(
  value: string,
  { locale = "es-AR", unit }: { locale?: string; unit?: string } = {},
) {
  const options: Intl.NumberFormatOptions = {
    signDisplay: "exceptZero",
    maximumFractionDigits: 1,
  };
  if (unit)
    return `${new Intl.NumberFormat(locale, options).format(value as Intl.StringNumericLiteral)} ${unit}`;
  return new Intl.NumberFormat(locale, { ...options, style: "percent" }).format(
    Number(value) / 100,
  );
}
