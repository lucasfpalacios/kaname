import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

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
