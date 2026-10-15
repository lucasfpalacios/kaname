"use client";

import { Command } from "cmdk";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { useId, useState, type ComponentProps } from "react";
import { cn } from "../../lib/cn";
import { controlBase } from "../../lib/control";
import { useFormFieldProps } from "../../lib/form-field-context";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";

export type ComboboxOption = {
  value: string;
  label: string;
  /** Otras palabras por las que se puede encontrar (SKU, alias). */
  keywords?: string[];
  disabled?: boolean;
};

export type ComboboxProps = Omit<
  ComponentProps<"button">,
  "value" | "onChange" | "children"
> & {
  options: ComboboxOption[];
  value: string | null;
  onValueChange: (value: string) => void;
  placeholder: string;
  searchPlaceholder: string;
  /** Texto cuando la búsqueda no encuentra nada. */
  emptyText: string;
};

// Select con búsqueda (Popover + cmdk), como el Combobox de shadcn/ui.
export function Combobox(rawProps: ComboboxProps) {
  const {
    options,
    value,
    onValueChange,
    placeholder,
    searchPlaceholder,
    emptyText,
    className,
    "aria-labelledby": labelledBy,
    ...props
  } = useFormFieldProps(rawProps);
  const [open, setOpen] = useState(false);
  const valueId = useId();
  const selected = options.find((option) => option.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          data-slot="combobox"
          className={cn(
            controlBase,
            "cursor-pointer justify-between gap-2 text-left",
            className,
          )}
          // Con FormField, el nombre accesible es la etiqueta más la opción elegida.
          aria-labelledby={labelledBy ? `${labelledBy} ${valueId}` : undefined}
          {...props}
        >
          <span
            id={valueId}
            className={cn("truncate", !selected && "text-muted-foreground")}
          >
            {selected?.label ?? placeholder}
          </span>
          <ChevronsUpDown
            aria-hidden="true"
            className="size-4 shrink-0 opacity-60"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) min-w-56 p-0"
        align="start"
      >
        <Command className="flex flex-col">
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search aria-hidden="true" className="size-4 shrink-0 opacity-60" />
            <Command.Input
              placeholder={searchPlaceholder}
              className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <Command.List className="max-h-64 overflow-y-auto p-1">
            <Command.Empty className="py-6 text-center text-sm opacity-70">
              {emptyText}
            </Command.Empty>
            {options.map((option) => (
              <Command.Item
                key={option.value}
                value={option.value}
                keywords={[option.label, ...(option.keywords ?? [])]}
                disabled={option.disabled}
                onSelect={() => {
                  onValueChange(option.value);
                  setOpen(false);
                }}
                className="relative flex cursor-pointer items-center rounded-sm py-2 pr-8 pl-2 text-sm outline-none select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:bg-foreground/8"
              >
                {option.label}
                {option.value === value && (
                  <Check
                    aria-hidden="true"
                    className="absolute right-2 size-4 text-primary"
                  />
                )}
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
