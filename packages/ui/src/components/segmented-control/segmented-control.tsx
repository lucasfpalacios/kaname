"use client";

import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import {
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { cn } from "../../lib/cn";
import { focusRing } from "../../lib/focus-ring";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../tooltip";

export type SegmentedControlOption = {
  value: string;
  /** Nombre de la opción: aria-label y tooltip ("Oscuro", "English"). */
  label: string;
  /** Lo que se ve en el segmento: un ícono o un texto corto. */
  content: ReactNode;
};

export type SegmentedControlProps = {
  options: SegmentedControlOption[];
  /** undefined: ninguna marcada (por ejemplo, el tema antes de montar). */
  value: string | undefined;
  /** `item` es el segmento presionado (para animaciones que salen de él). */
  onValueChange: (value: string, item: HTMLElement | null) => void;
  /** aria-label del grupo ("Tema", "Idioma"). */
  label: string;
  /**
   * Para animar un cambio que pasó fuera de este control (el de idioma, que vuelve a montar o a
   * mostrar el árbol de la página): la píldora se ubica en esta opción y se desliza a `value`.
   */
  animateFrom?: string;
  /** Cambiarlo vuelve a correr la animación desde `animateFrom`. */
  animationKey?: number;
  /** Tooltip con el nombre de cada opción (para los segmentos que son solo ícono). */
  tooltips?: boolean;
  disabled?: boolean;
  className?: string;
};

// Selector segmentado: un radiogroup (flechas para moverse, foco visible) con una píldora que se
// desliza al segmento activo en ~200 ms. Los segmentos tienen el mismo ancho, así la píldora se
// mueve con un translate. Con prefers-reduced-motion la píldora salta sin animar.
export function SegmentedControl({
  options,
  value,
  onValueChange,
  label,
  animateFrom,
  animationKey,
  tooltips = false,
  disabled,
  className,
}: SegmentedControlProps) {
  const items = useRef(new Map<string, HTMLButtonElement>());
  const indexOf = (target: string | undefined) =>
    options.findIndex((option) => option.value === target);
  const [pill, setPill] = useState(() => indexOf(value));
  // Sin transición: al aparecer (de ninguna marcada a una, por ejemplo el tema al montar) y al
  // ubicarse en `animateFrom`. Así la píldora no se desliza desde la primera opción al cargar.
  const [instant, setInstant] = useState(true);
  const pillRef = useRef(pill);
  const moveTo = (index: number, jump: boolean) => {
    pillRef.current = index;
    setInstant(jump);
    setPill(index);
  };

  useLayoutEffect(() => {
    if (animateFrom === undefined) return;
    // Antes de pintar: la píldora en la opción de antes, sin transición. El efecto de abajo la
    // desliza a `value` en el frame siguiente.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    moveTo(indexOf(animateFrom), true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animationKey]);

  useEffect(() => {
    // Corre al montar, al volver a mostrarse y al cambiar `value`.
    const frame = requestAnimationFrame(() =>
      moveTo(indexOf(value), pillRef.current < 0),
    );
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, animationKey]);

  const segments = options.map((option) => {
    const item = (
      <RadioGroupPrimitive.Item
        key={option.value}
        value={option.value}
        aria-label={option.label}
        ref={(element) => {
          if (element) items.current.set(option.value, element);
          else items.current.delete(option.value);
        }}
        className={cn(
          "relative z-10 flex h-7 w-9 cursor-pointer items-center justify-center rounded-full text-xs font-semibold tracking-wide text-foreground/60 transition-colors hover:text-foreground data-[state=checked]:text-foreground [&_svg]:size-4",
          "disabled:cursor-not-allowed",
          focusRing,
        )}
      >
        {option.content}
      </RadioGroupPrimitive.Item>
    );
    if (!tooltips) return item;
    return (
      <Tooltip key={option.value}>
        <TooltipTrigger asChild>{item}</TooltipTrigger>
        <TooltipContent>{option.label}</TooltipContent>
      </Tooltip>
    );
  });

  return (
    <TooltipProvider>
      <RadioGroupPrimitive.Root
        data-slot="segmented-control"
        aria-label={label}
        value={value ?? ""}
        disabled={disabled}
        orientation="horizontal"
        onValueChange={(next) =>
          onValueChange(next, items.current.get(next) ?? null)
        }
        className={cn(
          "relative inline-flex h-9 shrink-0 items-center rounded-full border border-border bg-foreground/5 p-[3px]",
          "has-disabled:opacity-50",
          className,
        )}
      >
        <span
          aria-hidden="true"
          data-slot="segmented-control-pill"
          className={cn(
            "absolute top-[3px] left-[3px] h-7 w-9 rounded-full border border-border bg-card shadow-sm",
            instant
              ? "transition-none"
              : "transition-[translate,opacity] duration-200 ease-out motion-reduce:transition-none",
            pill < 0 && "opacity-0",
          )}
          style={{ translate: `${Math.max(pill, 0) * 100}% 0` }}
        />
        {segments}
      </RadioGroupPrimitive.Root>
    </TooltipProvider>
  );
}
