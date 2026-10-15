import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";
import { type DateFormat, formatDate, isDateOnly } from "../../lib/format";

export type DateTextProps = Omit<
  ComponentProps<"time">,
  "children" | "dateTime"
> & {
  /** Date, ISO con hora ("2026-10-24T14:32:00Z") o fecha sola ("2026-10-24"). */
  value: Date | string;
  format?: DateFormat;
  locale?: string;
  /**
   * Zona horaria IANA. Conviene pasarla siempre ("America/Argentina/Buenos_Aires"): sin ella el
   * servidor y el navegador pueden mostrar horas distintas. Las fechas solas la ignoran.
   */
  timeZone?: string;
};

export function DateText({
  value,
  format = "date",
  locale,
  timeZone,
  className,
  ...props
}: DateTextProps) {
  const iso =
    typeof value === "string" && isDateOnly(value)
      ? value
      : new Date(value).toISOString();
  return (
    <time
      data-slot="date-text"
      dateTime={iso}
      className={cn("tabular-nums whitespace-nowrap", className)}
      {...props}
    >
      {formatDate(value, { locale, format, timeZone })}
    </time>
  );
}
