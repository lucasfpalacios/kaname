"use client";

import { type ReactNode, useId } from "react";
import { cn } from "../../lib/cn";
import { ModuleKanji, type ModuleKanjiKey } from "../module-kanji";
import { Switch } from "../switch";

export type ModuleSwitchProps = {
  module: ModuleKanjiKey;
  /** Nombre del módulo, ya traducido. */
  label: string;
  /** Ícono de lucide (el mismo del sidebar). */
  icon?: ReactNode;
  /** Debajo del nombre ("Siempre activo"). */
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
};

// Una fila de la configuración del espacio: ícono, kanji y nombre del módulo, con el switch que
// lo activa o lo apaga. El cambio se aplica al instante (por eso Switch y no Checkbox).
export function ModuleSwitch({
  module,
  label,
  icon,
  description,
  checked,
  onCheckedChange,
  disabled,
  className,
}: ModuleSwitchProps) {
  const id = useId();
  return (
    <div
      data-slot="module-switch"
      data-state={checked ? "checked" : "unchecked"}
      className={cn(
        "flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2.5",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="flex w-5 shrink-0 justify-center text-foreground/70 [&_svg]:size-5"
      >
        {icon}
      </span>
      <span aria-hidden="true" className="flex w-11 shrink-0">
        <ModuleKanji
          module={module}
          size="sm"
          className={cn("text-sm", !checked && "text-foreground/40")}
        />
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <label htmlFor={id} className="cursor-pointer text-sm font-medium">
          {label}
        </label>
        {description && (
          <p id={`${id}-description`} className="text-xs text-foreground/70">
            {description}
          </p>
        )}
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-describedby={description ? `${id}-description` : undefined}
      />
    </div>
  );
}
