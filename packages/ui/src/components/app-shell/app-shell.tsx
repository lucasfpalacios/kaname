"use client";

import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { cn } from "../../lib/cn";
import { focusRing } from "../../lib/focus-ring";
import { workspaceAccentProps } from "../workspace-accent";

// Estructura de la app: Sidebar a la izquierda, TopBar arriba y el contenido. Guarda si el
// sidebar está colapsado (escritorio) o abierto como drawer (mobile). El acento del espacio
// actual (Workspace.color) se aplica a toda la pantalla.

type AppShellContextValue = {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  /** El acento del espacio, para lo que se dibuja fuera del shell (el drawer en mobile). */
  accentColor?: string | null;
};

const AppShellContext = createContext<AppShellContextValue | null>(null);

/** Como useAppShell, pero null fuera de un AppShell (componentes que también se usan sueltos). */
export function useOptionalAppShell() {
  return useContext(AppShellContext);
}

export function useAppShell() {
  const context = useContext(AppShellContext);
  if (!context) throw new Error("useAppShell se usa dentro de <AppShell>.");
  return context;
}

export type AppShellProps = ComponentProps<"div"> & {
  sidebar: ReactNode;
  topBar?: ReactNode;
  /** Workspace.color del espacio actual. null usa el acento por defecto. */
  accentColor?: string | null;
  defaultCollapsed?: boolean;
  /** Controlado: para guardar la preferencia (por ejemplo en una cookie). */
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Texto del link "Saltar al contenido" (visible solo con el teclado). */
  skipToContentLabel?: string;
};

export function AppShell({
  sidebar,
  topBar,
  accentColor,
  defaultCollapsed = false,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  skipToContentLabel,
  className,
  style,
  children,
  ...props
}: AppShellProps) {
  const [innerCollapsed, setInnerCollapsed] = useState(defaultCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const collapsed = controlledCollapsed ?? innerCollapsed;
  const setCollapsed = useCallback(
    (next: boolean) => {
      if (controlledCollapsed === undefined) setInnerCollapsed(next);
      onCollapsedChange?.(next);
    },
    [controlledCollapsed, onCollapsedChange],
  );
  const value = useMemo(
    () => ({ collapsed, setCollapsed, mobileOpen, setMobileOpen, accentColor }),
    [collapsed, setCollapsed, mobileOpen, accentColor],
  );
  const accent = workspaceAccentProps(accentColor);

  return (
    <AppShellContext.Provider value={value}>
      <div
        data-slot="app-shell"
        data-workspace-accent={accent["data-workspace-accent"]}
        style={{ ...accent.style, ...style }}
        className={cn(
          "flex min-h-dvh bg-background font-sans text-foreground",
          className,
        )}
        {...props}
      >
        {skipToContentLabel && (
          <a
            href="#kaname-main"
            className={cn(
              "fixed top-2 left-2 z-50 -translate-y-20 rounded-md bg-card px-3 py-2 text-sm shadow-md focus:translate-y-0",
              focusRing,
            )}
          >
            {skipToContentLabel}
          </a>
        )}
        {sidebar}
        <div className="flex min-w-0 flex-1 flex-col">
          {topBar}
          <main
            id="kaname-main"
            tabIndex={-1}
            className="flex flex-1 flex-col gap-6 px-4 py-6 outline-none md:px-8 md:py-8"
          >
            {children}
          </main>
        </div>
      </div>
    </AppShellContext.Provider>
  );
}
