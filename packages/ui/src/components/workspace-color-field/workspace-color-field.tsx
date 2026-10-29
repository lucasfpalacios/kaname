"use client";

import { Check } from "lucide-react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { useId, useState } from "react";
import { cn } from "../../lib/cn";
import { focusRing } from "../../lib/focus-ring";
import { Badge } from "../badge";
import { Input } from "../input";
import { Label } from "../label";
import { ModuleKanji } from "../module-kanji";
import { isWorkspaceColor, WorkspaceAccent } from "../workspace-accent";
import { WorkspaceAvatar } from "../workspace-avatar";

/**
 * Colores sugeridos para un espacio: los de la paleta (Ruri-iro, Momo-iro, success, warning) y
 * los de los espacios de ejemplo. Todos se leen en claro y en oscuro (en oscuro el acento se aclara).
 */
export const WORKSPACE_COLOR_SUGGESTIONS = [
  "#1e50a2",
  "#3d6bd1",
  "#2a9d8f",
  "#2e7d5b",
  "#c88a35",
  "#e07a3f",
  "#c94f7c",
  "#f09199",
];

const NONE = "none";

export type WorkspaceColorFieldProps = {
  /** #rrggbb, o null para el acento por defecto del tema. */
  value: string | null;
  onChange: (color: string | null) => void;
  suggestions?: string[];
  labels: {
    /** Título del campo ("Color del espacio"). */
    legend: string;
    /** Opción sin color ("Por defecto"). */
    none: string;
    /** Campo para un color propio ("Otro color (#rrggbb)"). */
    custom: string;
    /** Título de la vista previa ("Vista previa"). */
    preview: string;
    /** Error del color propio que no es #rrggbb ("Usá un color con el formato #rrggbb."). */
    invalid: string;
    /** Lo que anuncia el lector al elegir un color ("Color elegido: #3d6bd1" / "...por defecto"). */
    announce: (color: string | null) => string;
  };
  /** Lo que muestra la vista previa con el acento elegido. */
  preview: { name: string; initials: string; badge: string };
  /** Error ya traducido que viene del formulario (por ejemplo, de la API). */
  error?: string;
  /**
   * Avisa si el color propio escrito es válido. Mientras no lo es, `value` sigue siendo el último
   * válido: el formulario tiene que bloquear el guardado (si no, guardaría otro color).
   */
  onValidityChange?: (valid: boolean) => void;
  disabled?: boolean;
  className?: string;
};

// Color de un espacio (Workspace.color): sugerencias de la paleta, un color propio en #rrggbb y
// la vista previa del acento (insignia, kanji y badge), que es todo lo que toma ese color.
export function WorkspaceColorField({
  value,
  onChange,
  suggestions = WORKSPACE_COLOR_SUGGESTIONS,
  labels,
  preview,
  error,
  onValidityChange,
  disabled,
  className,
}: WorkspaceColorFieldProps) {
  const id = useId();
  const [text, setText] = useState(value ?? "");
  // El error del texto se muestra al salir del campo, no mientras se escribe.
  const [blurred, setBlurred] = useState(false);
  // Solo cambia al elegir un color (no al escribir el nombre de la vista previa ni a medio color).
  const [announced, setAnnounced] = useState("");
  const selected = value === null ? NONE : value.toLowerCase();
  const textInvalid = text !== "" && !isWorkspaceColor(text);
  const shownError =
    error ?? (blurred && textInvalid ? labels.invalid : undefined);

  function choose(color: string | null) {
    onChange(color);
    setAnnounced(labels.announce(color));
  }

  return (
    <fieldset
      data-slot="workspace-color-field"
      disabled={disabled}
      className={cn("flex min-w-0 flex-col gap-4", className)}
    >
      <legend className="mb-2 text-sm font-medium">{labels.legend}</legend>
      <RadioGroupPrimitive.Root
        aria-label={labels.legend}
        value={
          suggestions.includes(selected) || selected === NONE ? selected : ""
        }
        onValueChange={(next) => {
          const color = next === NONE ? null : next;
          setText(color ?? "");
          setBlurred(false);
          onValidityChange?.(true);
          choose(color);
        }}
        className="flex flex-wrap gap-2"
      >
        <RadioGroupPrimitive.Item
          value={NONE}
          aria-label={labels.none}
          title={labels.none}
          className={cn(
            "flex size-9 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-border bg-card text-foreground/70 data-[state=checked]:border-foreground",
            focusRing,
          )}
        >
          <RadioGroupPrimitive.Indicator>
            <Check aria-hidden="true" className="size-4" />
          </RadioGroupPrimitive.Indicator>
        </RadioGroupPrimitive.Item>
        {suggestions.map((color) => (
          <RadioGroupPrimitive.Item
            key={color}
            value={color}
            aria-label={color}
            title={color}
            // El color del espacio va inline: es un dato, no un token.
            style={{ backgroundColor: color }}
            className={cn(
              "flex size-9 cursor-pointer items-center justify-center rounded-full border-2 border-transparent text-white data-[state=checked]:border-foreground",
              focusRing,
            )}
          >
            <RadioGroupPrimitive.Indicator>
              <Check aria-hidden="true" className="size-4 drop-shadow" />
            </RadioGroupPrimitive.Indicator>
          </RadioGroupPrimitive.Item>
        ))}
      </RadioGroupPrimitive.Root>
      <div className="flex max-w-56 flex-col gap-2">
        <Label htmlFor={`${id}-custom`}>{labels.custom}</Label>
        <Input
          id={`${id}-custom`}
          value={text}
          placeholder="#3d6bd1"
          maxLength={7}
          spellCheck={false}
          autoComplete="off"
          aria-invalid={Boolean(shownError) || undefined}
          aria-describedby={shownError ? `${id}-error` : undefined}
          onBlur={() => setBlurred(true)}
          onChange={(event) => {
            const next = event.target.value.trim();
            setText(next);
            const valid = next === "" || isWorkspaceColor(next);
            onValidityChange?.(valid);
            if (next === "") choose(null);
            else if (valid) choose(next.toLowerCase());
          }}
        />
        {shownError && (
          <p id={`${id}-error`} className="text-sm text-destructive">
            {shownError}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium tracking-label text-muted-foreground uppercase">
          {labels.preview}
        </p>
        <WorkspaceAccent
          color={value}
          className="flex items-center gap-3 rounded-md border border-border bg-background p-3"
        >
          <WorkspaceAvatar initials={preview.initials} />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="truncate font-display text-lg font-semibold">
              {preview.name}
            </span>
            <Badge variant="accent">{preview.badge}</Badge>
          </div>
          <ModuleKanji module="DASHBOARD" size="lg" />
        </WorkspaceAccent>
      </div>
      <span role="status" className="sr-only">
        {announced}
      </span>
    </fieldset>
  );
}
