"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { cn } from "../../lib/cn";
import { revealThemeChange } from "../../lib/theme-transition";
import { useTheme } from "../../theme/theme-provider";
import { IconButton } from "../icon-button";
import { SegmentedControl } from "../segmented-control";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip";

export type ThemeChoice = "light" | "dark" | "system";

export type ThemeToggleProps = {
  /** aria-label del grupo ("Tema"). */
  label: string;
  /** Nombre de cada opción: aria-label y tooltip de su ícono. */
  labels: { light: string; dark: string; system: string };
  /**
   * Texto del botón de pantallas chicas (aria-label y tooltip), con el tema actual y el que sigue:
   * ("Tema: Claro. Tocá para pasar a Oscuro"). Lo arma la app: el kit no compone textos.
   */
  cycleLabel: (current: string, next: string) => string;
  /** Después de cambiar el tema (para guardarlo, por ejemplo en el usuario). */
  onThemeChange?: (theme: ThemeChoice) => void;
  className?: string;
};

const CHOICES: ThemeChoice[] = ["light", "dark", "system"];
const ICONS = { light: Sun, dark: Moon, system: Monitor };

const subscribe = () => () => {};

// Tema claro / oscuro / sistema, sobre el ThemeProvider del kit (next-themes).
// - Desde 640 px: selector segmentado con los tres íconos y una píldora que se desliza al activo.
// - En pantallas chicas: un solo botón con el ícono del tema actual que rota claro → oscuro →
//   sistema.
// En el servidor no se conoce el tema: hasta montar no hay ninguno marcado (y el botón muestra el
// de sistema), así no hay diferencias de hidratación. Al cambiar, el tema nuevo aparece en un
// círculo que crece desde el ícono presionado (lib/theme-transition.ts); si el tema que queda es
// el mismo (por ejemplo, "sistema" cuando el sistema ya está en ese tema), no anima.
export function ThemeToggle({
  label,
  labels,
  cycleLabel,
  onThemeChange,
  className,
}: ThemeToggleProps) {
  const { theme, resolvedTheme, systemTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const current = mounted ? (theme as ThemeChoice | undefined) : undefined;

  function changeTheme(next: ThemeChoice, from: HTMLElement | null) {
    onThemeChange?.(next);
    const target = next === "system" ? systemTheme : next;
    const rect = from?.getBoundingClientRect();
    if (
      (target !== "light" && target !== "dark") ||
      target === resolvedTheme ||
      !rect
    ) {
      setTheme(next);
      return;
    }
    revealThemeChange({
      apply: () => setTheme(next),
      target,
      origin: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
    });
  }

  const shown = current ?? "system";
  const CurrentIcon = ICONS[shown];
  const nextChoice = CHOICES[(CHOICES.indexOf(shown) + 1) % CHOICES.length];

  return (
    <>
      <SegmentedControl
        label={label}
        tooltips
        value={current}
        onValueChange={(value, item) => changeTheme(value as ThemeChoice, item)}
        className={cn("hidden sm:inline-flex", className)}
        options={CHOICES.map((choice) => {
          const Icon = ICONS[choice];
          return { value: choice, label: labels[choice], content: <Icon /> };
        })}
      />
      <Tooltip>
        <TooltipTrigger asChild>
          <IconButton
            data-slot="theme-toggle-cycle"
            label={cycleLabel(labels[shown], labels[nextChoice])}
            className={cn("sm:hidden", className)}
            onClick={(event) => changeTheme(nextChoice, event.currentTarget)}
          >
            <CurrentIcon />
          </IconButton>
        </TooltipTrigger>
        <TooltipContent>
          {cycleLabel(labels[shown], labels[nextChoice])}
        </TooltipContent>
      </Tooltip>
    </>
  );
}
