"use client";

import { ChevronsLeft, ChevronsRight, Menu } from "lucide-react";
import { Slot } from "radix-ui";
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useContext,
} from "react";
import { cn } from "../../lib/cn";
import { focusRing } from "../../lib/focus-ring";
import { useAppShell } from "../app-shell";
import { IconButton } from "../icon-button";
import { ModuleKanji, type ModuleKanjiKey } from "../module-kanji";
import { Sheet, SheetContent, SheetTitle } from "../sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip";

// Sidebar de la app, dentro de AppShell. En escritorio se colapsa a una columna de kanji (el
// nombre queda en un tooltip y para lectores de pantalla); en mobile se abre como drawer desde
// SidebarMobileTrigger. Los ítems usan asChild para envolver el <Link> de la app.

type SidebarMode = "expanded" | "collapsed" | "mobile";

const SidebarModeContext = createContext<SidebarMode>("expanded");

/** true si el sidebar está colapsado (para componentes que van adentro, como WorkspaceSwitcher). */
export const useSidebarCollapsed = () =>
  useContext(SidebarModeContext) === "collapsed";

export type SidebarProps = Omit<ComponentProps<"nav">, "aria-label"> & {
  /** aria-label del nav y título del drawer en mobile ("Navegación"). */
  label: string;
};

export function Sidebar({
  label,
  className,
  children,
  ...props
}: SidebarProps) {
  const { collapsed, mobileOpen, setMobileOpen } = useAppShell();
  return (
    <>
      <nav
        data-slot="sidebar"
        aria-label={label}
        data-collapsed={collapsed || undefined}
        className={cn(
          "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-border bg-card md:flex motion-safe:transition-[width] motion-safe:duration-200",
          collapsed ? "w-16" : "w-64",
          className,
        )}
        {...props}
      >
        <SidebarModeContext.Provider
          value={collapsed ? "collapsed" : "expanded"}
        >
          {children}
        </SidebarModeContext.Provider>
      </nav>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          aria-describedby={undefined}
          className="w-72 max-w-[85vw] sm:max-w-[85vw]"
        >
          <SheetTitle className="sr-only">{label}</SheetTitle>
          <nav aria-label={label} className="flex h-full flex-col">
            <SidebarModeContext.Provider value="mobile">
              {children}
            </SidebarModeContext.Provider>
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}

export function SidebarHeader({ className, ...props }: ComponentProps<"div">) {
  const collapsed = useSidebarCollapsed();
  return (
    <div
      data-slot="sidebar-header"
      className={cn(
        "flex flex-col gap-2",
        collapsed ? "p-2" : "p-3",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarContent({ className, ...props }: ComponentProps<"div">) {
  const collapsed = useSidebarCollapsed();
  return (
    <div
      data-slot="sidebar-content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto",
        collapsed ? "p-2" : "p-3",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarFooter({ className, ...props }: ComponentProps<"div">) {
  const collapsed = useSidebarCollapsed();
  return (
    <div
      data-slot="sidebar-footer"
      className={cn(
        "mt-auto flex flex-col gap-1 border-t border-border",
        collapsed ? "items-center p-2" : "p-3",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarGroup({
  label,
  className,
  children,
  ...props
}: ComponentProps<"div"> & {
  /** Título del grupo; colapsado queda solo para lectores de pantalla. */
  label?: string;
}) {
  const collapsed = useSidebarCollapsed();
  return (
    <div
      data-slot="sidebar-group"
      className={cn("flex flex-col gap-1", className)}
      {...props}
    >
      {label && (
        <p
          className={cn(
            "px-3 pb-1 text-xs font-medium tracking-label text-foreground/60 uppercase",
            collapsed && "sr-only",
          )}
        >
          {label}
        </p>
      )}
      <ul className="flex flex-col gap-0.5">{children}</ul>
    </div>
  );
}

export type SidebarItemProps = Omit<ComponentProps<"a">, "children"> & {
  label: string;
  /** Módulo: da el kanji (colapsado y en el ítem activo). */
  module?: ModuleKanjiKey;
  /** Ícono de lucide. Decorativo. */
  icon?: ReactNode;
  active?: boolean;
  /** Al final del ítem expandido (un contador). */
  badge?: ReactNode;
  /** Envuelve el link de la app: <SidebarItem asChild><Link href="..." /></SidebarItem>. */
  asChild?: boolean;
  children?: ReactNode;
};

export function SidebarItem({
  label,
  module,
  icon,
  active = false,
  badge,
  asChild = false,
  className,
  onClick,
  children,
  ...props
}: SidebarItemProps) {
  const mode = useContext(SidebarModeContext);
  const { setMobileOpen } = useAppShell();
  const collapsed = mode === "collapsed";
  const Comp = asChild ? Slot.Root : "a";

  const link = (
    <Comp
      data-slot="sidebar-item"
      data-active={active || undefined}
      aria-current={active ? "page" : undefined}
      onClick={(event: React.MouseEvent<HTMLAnchorElement>) => {
        onClick?.(event);
        if (mode === "mobile") setMobileOpen(false);
      }}
      className={cn(
        "flex h-10 cursor-pointer items-center gap-3 rounded-md text-sm text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground",
        "data-active:bg-primary/10 data-active:font-medium data-active:text-foreground",
        "[&_svg]:size-5 [&_svg]:shrink-0",
        collapsed ? "justify-center px-0" : "px-3",
        focusRing,
        className,
      )}
      {...props}
    >
      {asChild && <Slot.Slottable>{children}</Slot.Slottable>}
      {collapsed && module ? (
        <ModuleKanji
          module={module}
          size="sm"
          className={cn("text-sm", !active && "text-foreground/60")}
        />
      ) : (
        icon && (
          <span
            aria-hidden="true"
            className={cn("flex", active && "text-primary")}
          >
            {icon}
          </span>
        )
      )}
      <span className={collapsed ? "sr-only" : "min-w-0 flex-1 truncate"}>
        {label}
      </span>
      {!collapsed && badge}
      {!collapsed && active && module && (
        <ModuleKanji module={module} size="sm" />
      )}
    </Comp>
  );

  return (
    <li>
      {collapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
      ) : (
        link
      )}
    </li>
  );
}

/** Botón para colapsar y expandir el sidebar en escritorio. En el drawer de mobile no aparece. */
export function SidebarCollapseButton({
  collapseLabel,
  expandLabel,
  className,
}: {
  collapseLabel: string;
  expandLabel: string;
  className?: string;
}) {
  const mode = useContext(SidebarModeContext);
  const { collapsed, setCollapsed } = useAppShell();
  if (mode === "mobile") return null;
  return (
    <IconButton
      label={collapsed ? expandLabel : collapseLabel}
      aria-expanded={!collapsed}
      size="sm"
      onClick={() => setCollapsed(!collapsed)}
      className={cn(!collapsed && "self-end", className)}
    >
      {collapsed ? <ChevronsRight /> : <ChevronsLeft />}
    </IconButton>
  );
}

/** Abre el sidebar como drawer. Va en la TopBar; solo se ve en mobile. */
export function SidebarMobileTrigger({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  const { setMobileOpen } = useAppShell();
  return (
    <IconButton
      label={label}
      className={cn("md:hidden", className)}
      onClick={() => setMobileOpen(true)}
    >
      <Menu />
    </IconButton>
  );
}
