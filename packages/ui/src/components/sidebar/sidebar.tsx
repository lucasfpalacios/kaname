"use client";

import { ChevronsLeft, ChevronsRight, Menu } from "lucide-react";
import { Slot } from "radix-ui";
import {
  type ComponentProps,
  createContext,
  type FocusEvent,
  type MouseEvent,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "../../lib/cn";
import { focusRing } from "../../lib/focus-ring";
import { useAppShell } from "../app-shell";
import { IconButton } from "../icon-button";
import { ModuleKanji, type ModuleKanjiKey } from "../module-kanji";
import { Sheet, SheetContent, SheetTitle } from "../sheet";
import { workspaceAccentProps } from "../workspace-accent";

// Sidebar de la app, dentro de AppShell. Cada ítem es ícono + kanji + nombre.
// - Colapsado (100 px): se ven el ícono y el kanji. El nombre sigue en el árbol de accesibilidad
//   (opacity-0, no display:none) para lectores de pantalla.
// - Al pasar el mouse (150 ms) o al recibir foco con teclado, se expande superpuesto al contenido
//   (no mueve el layout) y muestra el nombre. Vuelve a colapsar al salir.
// - Fijado expandido (256 px): el mismo formato, en el layout.
// - Mobile: drawer desde SidebarMobileTrigger, con la X de cerrar arriba del contenido.
// El contenido se arma siempre a 256 px y el nav lo recorta, así ícono y kanji nunca se mueven.
// El kanji es decorativo (aria-hidden): el ícono y el nombre traducido siempre están.
// Los ítems usan asChild para envolver el <Link> de la app.

type SidebarState = "expanded" | "collapsed" | "peek" | "mobile";

type SidebarContextValue = {
  state: SidebarState;
  /** Mantiene el sidebar expandido mientras un menú suyo está abierto (el de espacios). */
  setHold: (hold: boolean) => void;
};

const SidebarContext = createContext<SidebarContextValue>({
  state: "expanded",
  setHold: () => undefined,
});

export const useSidebarState = () => useContext(SidebarContext);

/** true si el sidebar está colapsado y no expandido por hover o foco. */
export const useSidebarCollapsed = () =>
  useContext(SidebarContext).state === "collapsed";

const PEEK_DELAY = 150;
const INNER_WIDTH = "w-64";

// Clases que esconden algo solo cuando el sidebar está colapsado (sin hover ni foco).
const hiddenWhenCollapsed =
  "transition-opacity group-data-[state=collapsed]/sidebar:opacity-0";

export type SidebarProps = Omit<ComponentProps<"nav">, "aria-label"> & {
  /** aria-label del nav y título del drawer en mobile ("Navegación"). */
  label: string;
  /** aria-label de la X del drawer en mobile ("Cerrar"). */
  closeLabel: string;
};

export function Sidebar({
  label,
  closeLabel,
  className,
  children,
  ...props
}: SidebarProps) {
  const { collapsed, mobileOpen, setMobileOpen, accentColor } = useAppShell();
  // El drawer va en un portal, fuera de AppShell: lleva el acento del espacio por su cuenta.
  const accent = workspaceAccentProps(accentColor);
  const [hover, setHover] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const [hold, setHold] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const peek = collapsed && (hover || keyboardFocus || hold);
  const state: SidebarState = !collapsed
    ? "expanded"
    : peek
      ? "peek"
      : "collapsed";
  const value = useMemo(() => ({ state, setHold }), [state]);
  const mobileValue = useMemo(
    () => ({ state: "mobile" as const, setHold: () => undefined }),
    [],
  );

  const onMouseEnter = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setHover(true), PEEK_DELAY);
  };
  const onMouseLeave = () => {
    clearTimeout(timer.current);
    setHover(false);
  };
  // Solo el foco de teclado expande: un clic deja el foco en el link y el sidebar tiene que
  // poder colapsar al sacar el mouse.
  const onFocus = (event: FocusEvent<HTMLElement>) => {
    if (event.target.matches(":focus-visible")) setKeyboardFocus(true);
  };
  const onBlur = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget))
      setKeyboardFocus(false);
  };

  return (
    <>
      {/* Reserva el ancho en el layout; el nav se superpone al expandirse por hover o foco. */}
      <div
        data-slot="sidebar-spacer"
        className={cn(
          "sticky top-0 z-40 hidden h-dvh shrink-0 md:block motion-safe:transition-[width] motion-safe:duration-200",
          collapsed ? "w-[100px]" : INNER_WIDTH,
        )}
      >
        <nav
          data-slot="sidebar"
          aria-label={label}
          data-state={state}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onFocus={onFocus}
          onBlur={onBlur}
          className={cn(
            "group/sidebar absolute inset-y-0 left-0 overflow-hidden border-r border-border bg-card motion-safe:transition-[width,box-shadow] motion-safe:duration-150",
            state === "collapsed" ? "w-[100px]" : INNER_WIDTH,
            state === "peek" && "shadow-lg",
            className,
          )}
          {...props}
        >
          <div className={cn("flex h-full flex-col", INNER_WIDTH)}>
            <SidebarContext.Provider value={value}>
              {children}
            </SidebarContext.Provider>
          </div>
        </nav>
      </div>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          closeLabel={closeLabel}
          aria-describedby={undefined}
          data-workspace-accent={accent["data-workspace-accent"]}
          style={accent.style}
          className="w-72 max-w-[85vw] pt-12 sm:max-w-[85vw]"
        >
          <SheetTitle className="sr-only">{label}</SheetTitle>
          <nav
            aria-label={label}
            data-state="mobile"
            className="group/sidebar flex h-full flex-col"
          >
            <SidebarContext.Provider value={mobileValue}>
              {children}
            </SidebarContext.Provider>
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}

// Mismo padding en todos los estados: así el contenido no se corre al expandir.
export function SidebarHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  );
}

export function SidebarContent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto p-2",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      className={cn(
        "mt-auto flex flex-col items-start gap-1 border-t border-border p-2",
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
  /** Título del grupo. Colapsado queda invisible pero ocupa su lugar (los ítems no se corren). */
  label?: string;
}) {
  return (
    <div
      data-slot="sidebar-group"
      className={cn("flex flex-col gap-1", className)}
      {...props}
    >
      {label && (
        <p
          className={cn(
            "truncate px-2 pb-1 text-xs font-medium tracking-label whitespace-nowrap text-muted-foreground uppercase",
            hiddenWhenCollapsed,
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
  /** Módulo: da el kanji. */
  module?: ModuleKanjiKey;
  /** Ícono de lucide. Siempre visible. */
  icon?: ReactNode;
  active?: boolean;
  /** Al final del ítem (un contador). */
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
  const { state } = useSidebarState();
  const { setMobileOpen } = useAppShell();
  const Comp = asChild ? Slot.Root : "a";

  return (
    <li>
      <Comp
        data-slot="sidebar-item"
        data-active={active || undefined}
        aria-current={active ? "page" : undefined}
        onClick={(event: MouseEvent<HTMLAnchorElement>) => {
          onClick?.(event);
          if (state === "mobile") setMobileOpen(false);
        }}
        className={cn(
          "flex h-10 w-full cursor-pointer items-center gap-2 rounded-md px-2 text-sm text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground",
          "data-active:bg-primary/10 data-active:font-medium data-active:text-foreground",
          // Colapsado, el fondo del ítem activo termina en el borde del sidebar.
          "group-data-[state=collapsed]/sidebar:w-[84px]",
          focusRing,
          className,
        )}
        {...props}
      >
        {asChild && <Slot.Slottable>{children}</Slot.Slottable>}
        <span
          aria-hidden="true"
          className={cn(
            "flex w-5 shrink-0 justify-center [&_svg]:size-5",
            active && "text-primary",
          )}
        >
          {icon}
        </span>
        {/* Columna fija: entran los kanji de 3 caracteres (価格表, 仕入先). */}
        <span aria-hidden="true" className="flex w-11 shrink-0">
          {module && (
            <ModuleKanji
              module={module}
              size="sm"
              className={cn("text-sm", !active && "text-foreground/50")}
            />
          )}
        </span>
        <span className={cn("min-w-0 flex-1 truncate", hiddenWhenCollapsed)}>
          {label}
        </span>
        {badge && <span className={hiddenWhenCollapsed}>{badge}</span>}
      </Comp>
    </li>
  );
}

/** Fija el sidebar expandido o lo colapsa. En el drawer de mobile no aparece. */
export function SidebarCollapseButton({
  collapseLabel,
  expandLabel,
  className,
}: {
  collapseLabel: string;
  expandLabel: string;
  className?: string;
}) {
  const { state } = useSidebarState();
  const { collapsed, setCollapsed } = useAppShell();
  if (state === "mobile") return null;
  return (
    <IconButton
      label={collapsed ? expandLabel : collapseLabel}
      aria-expanded={!collapsed}
      size="sm"
      onClick={() => setCollapsed(!collapsed)}
      className={cn("ml-1", className)}
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
