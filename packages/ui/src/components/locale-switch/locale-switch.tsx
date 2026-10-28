"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/cn";
import { useDecodeText } from "../../lib/use-decode-text";
import { SegmentedControl } from "../segmented-control";

export type LocaleSwitchOption = {
  value: string;
  /** Lo que se ve en el segmento ("ES"). */
  short: string;
  /** Nombre del idioma para el lector de pantalla ("Español"). */
  name: string;
};

export type LocaleSwitchProps = {
  options: LocaleSwitchOption[];
  value: string;
  onValueChange: (value: string) => void;
  /** aria-label del grupo ("Idioma"). */
  label: string;
  disabled?: boolean;
  className?: string;
};

// Último cambio hecho con el switch. Al cambiar de idioma la app suele volver a montar el switch
// (cambia la URL); con esto, el switch nuevo arranca la píldora y las letras desde el idioma de
// antes, así la animación se ve igual. Vale solo un momento después del cambio.
let lastChange: { from: string; to: string; at: number } | null = null;
const CHANGE_WINDOW_MS = 2500;

// Sin efectos secundarios: se llama desde el inicializador del estado (en modo estricto, dos
// veces). El cambio se descarta después de montar.
function recentChange(value: string) {
  const change = lastChange;
  if (!change || change.to !== value) return undefined;
  if (Date.now() - change.at > CHANGE_WINDOW_MS) return undefined;
  return change.from;
}

function DecodedLabel({ text, from }: { text: string; from?: string }) {
  return <span aria-hidden="true">{useDecodeText(text, from)}</span>;
}

// Switch de idioma ES | EN: el mismo selector segmentado que el del tema, con la píldora que se
// desliza. Al cambiar, las letras del idioma elegido se "decodifican" desde las del anterior
// (ES → EN letra por letra). Con prefers-reduced-motion, todo cambia al instante.
export function LocaleSwitch({
  options,
  value,
  onValueChange,
  label,
  disabled,
  className,
}: LocaleSwitchProps) {
  // Idioma desde el que se anima este montaje o este cambio (undefined: sin animación).
  const [from, setFrom] = useState<string | undefined>(() =>
    recentChange(value),
  );
  const previous = useRef(value);
  const shortOf = (target: string | undefined) =>
    options.find((option) => option.value === target)?.short;

  useEffect(() => {
    // Ya montado (y animado si correspondía): el cambio no se vuelve a usar.
    if (lastChange?.to === previous.current) lastChange = null;
  }, []);

  useEffect(() => {
    // Mismo componente, otro valor (sin volver a montar): anima desde el anterior.
    if (previous.current !== value) {
      // lastChange queda: si este switch se desmonta enseguida (cambia la URL), el que lo
      // reemplaza lo usa para animar desde el idioma anterior.
      setFrom(previous.current);
      previous.current = value;
    }
  }, [value]);

  return (
    <SegmentedControl
      label={label}
      value={value}
      animateFrom={from}
      disabled={disabled}
      className={cn(className)}
      onValueChange={(next) => {
        lastChange = { from: value, to: next, at: Date.now() };
        onValueChange(next);
      }}
      options={options.map((option) => ({
        value: option.value,
        label: option.name,
        content: (
          <DecodedLabel
            text={option.short}
            from={option.value === value ? shortOf(from) : undefined}
          />
        ),
      }))}
    />
  );
}
