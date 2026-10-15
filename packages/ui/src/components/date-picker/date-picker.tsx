"use client";

import { CalendarDays } from "lucide-react";
import type { Matcher } from "react-day-picker";
import { useId, useState, type ComponentProps } from "react";
import { cn } from "../../lib/cn";
import { controlBase } from "../../lib/control";
import { useFormFieldProps } from "../../lib/form-field-context";
import { Calendar } from "../calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";

export type DatePickerProps = Omit<
  ComponentProps<"button">,
  "value" | "onChange" | "children"
> & {
  value: Date | undefined;
  onValueChange: (date: Date | undefined) => void;
  placeholder: string;
  /** Locale BCP 47 para el texto del botón y el calendario. Por defecto es-AR. */
  locale?: string;
  /** Días que no se pueden elegir (por ejemplo { after: new Date() }). */
  disabledDays?: Matcher | Matcher[];
};

export function DatePicker(rawProps: DatePickerProps) {
  const {
    value,
    onValueChange,
    placeholder,
    locale = "es-AR",
    disabledDays,
    className,
    "aria-labelledby": labelledBy,
    ...props
  } = useFormFieldProps(rawProps);
  const [open, setOpen] = useState(false);
  const valueId = useId();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-slot="date-picker"
          className={cn(
            controlBase,
            "cursor-pointer gap-2 text-left",
            className,
          )}
          // Con FormField, el nombre accesible es la etiqueta más la fecha elegida.
          aria-labelledby={labelledBy ? `${labelledBy} ${valueId}` : undefined}
          {...props}
        >
          <CalendarDays
            aria-hidden="true"
            className="size-4 shrink-0 opacity-60"
          />
          <span
            id={valueId}
            className={cn("truncate", !value && "text-muted-foreground")}
          >
            {value
              ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
                  value,
                )
              : placeholder}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          locale={locale}
          selected={value}
          defaultMonth={value}
          disabled={disabledDays}
          onSelect={(date) => {
            onValueChange(date);
            setOpen(false);
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
