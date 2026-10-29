"use client";

import { X } from "lucide-react";
import { type KeyboardEvent, useState } from "react";
import { cn } from "../../lib/cn";
import { controlGroup, controlGroupInput } from "../../lib/control";
import { useFormFieldProps } from "../../lib/form-field-context";
import { focusRing } from "../../lib/focus-ring";

export type TagInputProps = {
  value: string[];
  onChange: (value: string[]) => void;
  /** aria-label del botón que saca un valor ("Quitar {valor}"). */
  removeLabel: (tag: string) => string;
  placeholder?: string;
  /** Máximo de valores (después no se suman más; se pueden sacar). */
  max?: number;
  disabled?: boolean;
  id?: string;
  className?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

// Lista de valores cortos que se escriben y se suman con Enter o coma ("EN", "ES", "JP"). Sin
// repetidos (sin importar mayúsculas). Backspace con el campo vacío saca el último. Los valores
// se ven como chips con su botón para quitarlos.
export function TagInput(rawProps: TagInputProps) {
  const {
    value,
    onChange,
    removeLabel,
    placeholder,
    max,
    disabled,
    className,
    ...field
  } = useFormFieldProps(rawProps);
  const [text, setText] = useState("");

  // Suma uno o varios valores separados por coma ("EN, ES, JP" pegado), sin repetidos ni pasar
  // del máximo.
  function add(raw: string) {
    const next = [...value];
    for (const part of raw.split(",")) {
      const tag = part.trim();
      if (!tag || (max !== undefined && next.length >= max)) continue;
      if (next.some((item) => item.toLowerCase() === tag.toLowerCase()))
        continue;
      next.push(tag);
    }
    if (next.length > value.length) onChange(next);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      add(text);
      setText("");
    } else if (event.key === "Backspace" && text === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div
      data-slot="tag-input"
      className={cn(
        controlGroup,
        "h-auto min-h-10 flex-wrap gap-1.5 p-1.5",
        className,
      )}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-sm border border-border bg-foreground/5 py-0.5 pr-0.5 pl-2 text-xs font-medium"
        >
          {tag}
          <button
            type="button"
            aria-label={removeLabel(tag)}
            disabled={disabled}
            onClick={() => onChange(value.filter((item) => item !== tag))}
            className={cn(
              "flex size-5 cursor-pointer items-center justify-center rounded-sm text-foreground/60 hover:bg-foreground/10 hover:text-foreground",
              focusRing,
              "focus-visible:ring-offset-0",
            )}
          >
            <X aria-hidden="true" className="size-3" />
          </button>
        </span>
      ))}
      <input
        {...field}
        value={text}
        disabled={disabled}
        placeholder={value.length === 0 ? placeholder : undefined}
        onChange={(event) => {
          // Lo que queda antes de la última coma se suma; lo de después se sigue escribiendo.
          const text = event.target.value;
          const cut = text.lastIndexOf(",");
          if (cut === -1) return setText(text);
          add(text.slice(0, cut));
          setText(text.slice(cut + 1));
        }}
        onKeyDown={onKeyDown}
        // Lo que quedó escrito al salir también se suma.
        onBlur={() => {
          add(text);
          setText("");
        }}
        className={cn(controlGroupInput, "h-7 min-w-20 flex-1 px-1.5")}
      />
    </div>
  );
}
