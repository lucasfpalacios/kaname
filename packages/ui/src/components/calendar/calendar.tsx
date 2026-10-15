"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, type DayPickerProps } from "react-day-picker";
import { enUS, es } from "react-day-picker/locale";
import { cn } from "../../lib/cn";
import { focusRing } from "../../lib/focus-ring";
import { buttonVariants } from "../button";

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;

export type CalendarProps = DistributiveOmit<DayPickerProps, "locale"> & {
  /** Locale BCP 47 ("es-AR", "en-US"). Por ahora el calendario traduce español e inglés. */
  locale?: string;
};

function Chevron({
  orientation,
  className,
}: {
  orientation?: "up" | "down" | "left" | "right";
  className?: string;
}) {
  const Icon = orientation === "left" ? ChevronLeft : ChevronRight;
  return <Icon aria-hidden="true" className={cn("size-4", className)} />;
}

const navButton = cn(
  buttonVariants({ variant: "ghost", size: "sm" }),
  "size-8 px-0 aria-disabled:opacity-50",
);

// Adaptado del Calendar de shadcn/ui (react-day-picker), con estilos de Tailwind en vez del CSS
// de la librería.
export function Calendar({
  locale = "es-AR",
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      data-slot="calendar"
      locale={locale.toLowerCase().startsWith("en") ? enUS : es}
      showOutsideDays={showOutsideDays}
      className={cn("w-fit p-3", className)}
      classNames={{
        months: "relative flex flex-col gap-4",
        month: "flex flex-col gap-4",
        nav: "absolute inset-x-0 top-0 flex items-center justify-between",
        button_previous: navButton,
        button_next: navButton,
        month_caption: "flex h-8 items-center justify-center",
        caption_label: "text-sm font-medium first-letter:uppercase",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "w-9 text-xs font-normal opacity-70",
        week: "mt-1 flex w-full",
        day: "relative size-9 p-0 text-center text-sm",
        day_button: cn(
          "flex size-9 cursor-pointer items-center justify-center rounded-md tabular-nums transition-colors hover:bg-foreground/8",
          focusRing,
        ),
        selected:
          "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary",
        today:
          "[&>button]:font-bold [&>button]:underline [&>button]:underline-offset-4",
        outside: "text-foreground/45",
        disabled: "opacity-50 [&>button]:cursor-not-allowed",
        hidden: "invisible",
        ...classNames,
      }}
      components={{ Chevron }}
      {...props}
    />
  );
}
