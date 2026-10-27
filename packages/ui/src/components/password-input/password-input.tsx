"use client";

import { Eye, EyeOff } from "lucide-react";
import { type ComponentProps, useState } from "react";
import { cn } from "../../lib/cn";
import { controlGroup, controlGroupInput } from "../../lib/control";
import { useFormFieldProps } from "../../lib/form-field-context";
import { focusRing } from "../../lib/focus-ring";

export type PasswordInputProps = Omit<ComponentProps<"input">, "type"> & {
  /** aria-label del botón cuando la contraseña está oculta ("Mostrar contraseña"). */
  showLabel: string;
  /** aria-label del botón cuando se ve ("Ocultar contraseña"). */
  hideLabel: string;
};

// Campo de contraseña con un botón para mostrarla u ocultarla. El botón va después del campo en el
// orden de tabulación y anuncia su estado con aria-pressed.
export function PasswordInput(rawProps: PasswordInputProps) {
  const { showLabel, hideLabel, className, disabled, ...props } =
    useFormFieldProps(rawProps);
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;

  return (
    <div data-slot="password-input" className={cn(controlGroup, className)}>
      <input
        data-slot="password-input-field"
        type={visible ? "text" : "password"}
        className={controlGroupInput}
        disabled={disabled}
        {...props}
      />
      <button
        type="button"
        aria-label={visible ? hideLabel : showLabel}
        aria-pressed={visible}
        disabled={disabled}
        onClick={() => setVisible((value) => !value)}
        className={cn(
          "mr-1 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-foreground/8 hover:text-foreground disabled:cursor-not-allowed [&_svg]:size-4",
          focusRing,
          "focus-visible:ring-offset-0",
        )}
      >
        <Icon aria-hidden="true" />
      </button>
    </div>
  );
}
