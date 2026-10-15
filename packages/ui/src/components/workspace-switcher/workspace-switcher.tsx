"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { Slot } from "radix-ui";
import type { ReactElement, ReactNode } from "react";
import { cn } from "../../lib/cn";
import { focusRing } from "../../lib/focus-ring";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { useSidebarCollapsed, useSidebarState } from "../sidebar";
import { WorkspaceAvatar } from "../workspace-avatar";

export type WorkspaceSwitcherItem = {
  id: string;
  name: string;
  /** Tipo o rol ("Emprendimiento", "Panel consolidado"). */
  description?: string;
  initials?: string;
  /** Ícono en lugar de iniciales (General). */
  icon?: ReactNode;
  color?: string | null;
  /**
   * Link al espacio, por composición: el elemento del link de la app sin contenido
   * (`<Link href="/tank-vault" />`). El kit le pone adentro la insignia y el nombre. Si no hay
   * link, el ítem llama a onSelect.
   */
  link?: ReactElement;
};

export type WorkspaceSwitcherProps = {
  workspaces: WorkspaceSwitcherItem[];
  currentId: string;
  /** Qué hace el botón ("Cambiar de espacio"). Se anuncia junto al espacio actual. */
  label: string;
  /** Título de la lista ("Espacios"). */
  groupLabel?: string;
  onSelect?: (id: string) => void;
  /** Ítems al final del menú (DropdownMenuItem "Nuevo espacio"). */
  footer?: ReactNode;
  className?: string;
};

// Selector de espacio, arriba del sidebar. Colapsado se ve solo la insignia: el texto queda con
// opacity-0 (no se corre nada al expandir). Mientras el menú está abierto, el sidebar no colapsa.
const hiddenWhenCollapsed =
  "transition-opacity group-data-[state=collapsed]/sidebar:opacity-0";

export function WorkspaceSwitcher({
  workspaces,
  currentId,
  label,
  groupLabel,
  onSelect,
  footer,
  className,
}: WorkspaceSwitcherProps) {
  const collapsed = useSidebarCollapsed();
  const { setHold } = useSidebarState();
  const current =
    workspaces.find((workspace) => workspace.id === currentId) ?? workspaces[0];
  if (!current) return null;

  return (
    <DropdownMenu onOpenChange={setHold}>
      <DropdownMenuTrigger
        className={cn(
          "flex w-full cursor-pointer items-center gap-3 rounded-md border border-border p-1.5 text-left transition-colors hover:bg-foreground/5 data-[state=open]:bg-foreground/5",
          "group-data-[state=collapsed]/sidebar:w-[84px] group-data-[state=collapsed]/sidebar:border-transparent",
          focusRing,
          className,
        )}
      >
        <WorkspaceAvatar
          initials={current.initials}
          icon={current.icon}
          color={current.color}
        />
        <span
          className={cn("flex min-w-0 flex-1 flex-col", hiddenWhenCollapsed)}
        >
          <span className="sr-only">{label}: </span>
          <span className="truncate text-sm font-bold">{current.name}</span>
          {current.description && (
            <span className="truncate text-xs text-foreground/70">
              {current.description}
            </span>
          )}
        </span>
        <ChevronsUpDown
          aria-hidden="true"
          className={cn("size-4 shrink-0 opacity-60", hiddenWhenCollapsed)}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side={collapsed ? "right" : "bottom"}
        className="w-64"
      >
        {groupLabel && <DropdownMenuLabel>{groupLabel}</DropdownMenuLabel>}
        {workspaces.map((workspace) => {
          const selected = workspace.id === current.id;
          const content = (
            <>
              <WorkspaceAvatar
                initials={workspace.initials}
                icon={workspace.icon}
                color={workspace.color}
                size="sm"
              />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate">{workspace.name}</span>
                {workspace.description && (
                  <span className="truncate text-xs text-foreground/70">
                    {workspace.description}
                  </span>
                )}
              </span>
              {selected && (
                <Check aria-hidden="true" className="text-primary" />
              )}
            </>
          );
          return workspace.link ? (
            <DropdownMenuItem key={workspace.id} asChild>
              <Slot.Root aria-current={selected ? "page" : undefined}>
                <Slot.Slottable>{workspace.link}</Slot.Slottable>
                {content}
              </Slot.Root>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              key={workspace.id}
              onSelect={() => onSelect?.(workspace.id)}
            >
              {content}
            </DropdownMenuItem>
          );
        })}
        {footer && (
          <>
            <DropdownMenuSeparator />
            {footer}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
