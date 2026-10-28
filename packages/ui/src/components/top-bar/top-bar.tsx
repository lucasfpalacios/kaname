import { Search } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";
import { controlGroup, controlGroupInput } from "../../lib/control";

// Barra superior de AppShell. Solo la estructura: la app arma adentro el SidebarMobileTrigger,
// la búsqueda, idioma, tema, notificaciones y usuario. TopBarActions empuja lo suyo a la derecha.
export function TopBar({ className, ...props }: ComponentProps<"header">) {
  return (
    <header
      data-slot="top-bar"
      className={cn(
        "sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur md:px-6",
        className,
      )}
      {...props}
    />
  );
}

export function TopBarActions({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="top-bar-actions"
      className={cn("ml-auto flex items-center gap-1 sm:gap-2", className)}
      {...props}
    />
  );
}

export type TopBarSearchProps = Omit<ComponentProps<"input">, "type"> & {
  /** aria-label del campo ("Buscar"). */
  label: string;
};

/** Búsqueda global de la TopBar. Se esconde en pantallas chicas. */
export function TopBarSearch({
  label,
  className,
  ...props
}: TopBarSearchProps) {
  return (
    <label
      data-slot="top-bar-search"
      className={cn(controlGroup, "hidden max-w-md sm:flex", className)}
    >
      <Search aria-hidden="true" className="ml-3 size-4 shrink-0 opacity-60" />
      <input
        type="search"
        aria-label={label}
        className={controlGroupInput}
        {...props}
      />
    </label>
  );
}
