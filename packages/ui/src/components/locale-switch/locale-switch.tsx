"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
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

// Último cambio hecho con el switch. Al cambiar de idioma la app monta el árbol del idioma nuevo
// o, si ya lo visitó, vuelve a mostrar el que Next dejó oculto (con su switch tal como quedó).
// Con esto, ese switch anima la píldora y las letras desde el idioma de antes. Vale un momento.
let lastChange: { from: string; to: string; at: number } | null = null;
const CHANGE_WINDOW_MS = 2500;

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
  // Animación en curso: desde qué idioma, y una clave que la reinicia.
  const [animation, setAnimation] = useState<{ from: string; key: number }>();
  const previous = useRef(value);
  const shortOf = (target: string | undefined) =>
    options.find((option) => option.value === target)?.short;
  const animate = (from: string) =>
    setAnimation((current) => ({ from, key: (current?.key ?? 0) + 1 }));

  useLayoutEffect(() => {
    // Al montar y cada vez que el árbol vuelve a mostrarse (los efectos de layout corren en los
    // dos casos, antes de pintar). En modo estricto corre dos veces: la segunda ya no encuentra
    // el cambio.
    const from = recentChange(value);
    if (!from) return;
    lastChange = null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    animate(from);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Mismo switch, otro valor (sin cambiar de árbol): anima desde el anterior.
    if (previous.current === value) return;
    const from = previous.current;
    previous.current = value;
    animate(from);
  }, [value]);

  return (
    <SegmentedControl
      label={label}
      value={value}
      animateFrom={animation?.from}
      animationKey={animation?.key}
      disabled={disabled}
      className={cn(className)}
      onValueChange={(next) => {
        lastChange = { from: value, to: next, at: Date.now() };
        onValueChange(next);
      }}
      options={options.map((option) => ({
        value: option.value,
        label: option.name,
        content:
          option.value === value ? (
            // La clave reinicia la decodificación aunque se repita el mismo cambio.
            <DecodedLabel
              key={animation?.key}
              text={option.short}
              from={shortOf(animation?.from)}
            />
          ) : (
            <DecodedLabel text={option.short} />
          ),
      }))}
    />
  );
}
