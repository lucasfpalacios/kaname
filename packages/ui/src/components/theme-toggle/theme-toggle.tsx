"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { useTheme } from "../../theme/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { IconButton } from "../icon-button";

export type ThemeToggleProps = {
  /** aria-label del botón ("Tema"). */
  label: string;
  labels: { light: string; dark: string; system: string };
  /** Abre el menú al montar (stories y pruebas). */
  defaultOpen?: boolean;
  className?: string;
};

const subscribe = () => () => {};

// Tema claro / oscuro / sistema, sobre el ThemeProvider del kit (next-themes). En el servidor no
// se conoce el tema: hasta montar se muestra el ícono de sistema y ninguna opción marcada, así
// no hay diferencias de hidratación.
export function ThemeToggle({
  label,
  labels,
  defaultOpen,
  className,
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
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

  return (
    <DropdownMenu defaultOpen={defaultOpen}>
      <DropdownMenuTrigger asChild>
        <IconButton label={label} className={className}>
          <Icon />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={mounted ? theme : undefined}
          onValueChange={setTheme}
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
