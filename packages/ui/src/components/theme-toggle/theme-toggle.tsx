"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useRef, useSyncExternalStore } from "react";
import { revealThemeChange } from "../../lib/theme-transition";
import { useTheme } from "../../theme/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { IconButton } from "../icon-button";

export type ThemeChoice = "light" | "dark" | "system";

export type ThemeToggleProps = {
  /** aria-label del botón ("Tema"). */
  label: string;
  labels: { light: string; dark: string; system: string };
  /** Abre el menú al montar (stories y pruebas). */
  defaultOpen?: boolean;
  /** Después de cambiar el tema (para guardarlo, por ejemplo en el usuario). */
  onThemeChange?: (theme: ThemeChoice) => void;
  className?: string;
};

const subscribe = () => () => {};

// Tema claro / oscuro / sistema, sobre el ThemeProvider del kit (next-themes). En el servidor no
// se conoce el tema: hasta montar se muestra el ícono de sistema y ninguna opción marcada, así
// no hay diferencias de hidratación. Al cambiar, el tema nuevo aparece en un círculo que crece
// desde el botón (lib/theme-transition.ts); si el tema que queda es el mismo (por ejemplo,
// "sistema" cuando el sistema ya está en ese tema), no anima.
export function ThemeToggle({
  label,
  labels,
  defaultOpen,
  onThemeChange,
  className,
}: ThemeToggleProps) {
  const { theme, resolvedTheme, systemTheme, setTheme } = useTheme();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const Icon =
    !mounted || theme === "system"
      ? Monitor
      : resolvedTheme === "dark"
        ? Moon
        : Sun;

  function changeTheme(next: string) {
    onThemeChange?.(next as ThemeChoice);
    const target = next === "system" ? systemTheme : next;
    const rect = triggerRef.current?.getBoundingClientRect();
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

  return (
    <DropdownMenu defaultOpen={defaultOpen}>
      <DropdownMenuTrigger asChild>
        <IconButton ref={triggerRef} label={label} className={className}>
          <Icon />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={mounted ? theme : undefined}
          onValueChange={changeTheme}
        >
          <DropdownMenuRadioItem value="light">
            <Sun />
            {labels.light}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            <Moon />
            {labels.dark}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            <Monitor />
            {labels.system}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
