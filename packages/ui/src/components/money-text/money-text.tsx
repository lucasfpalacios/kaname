import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";
import { formatMoney, type MoneyFormatOptions } from "../../lib/format";

export type MoneyTextProps = Omit<ComponentProps<"span">, "children"> &
  MoneyFormatOptions & {
    /** Monto como string decimal ("1234.5"), igual que moneySchema. null muestra `emptyText`. */
    value: string | null;
    emptyText?: string;
  };

// Monto de solo lectura. Nunca corta en dos líneas y alinea los dígitos en columnas.
export function MoneyText({
  value,
  currency,
  locale,
  hideDecimals,
  compact,
  emptyText = "—",
  className,
  ...props
}: MoneyTextProps) {
  return (
    <span
      data-slot="money-text"
      className={cn("tabular-nums whitespace-nowrap", className)}
      {...props}
    >
      {value === null
        ? emptyText
        : formatMoney(value, { currency, locale, hideDecimals, compact })}
    </span>
  );
}
