import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { focusRing } from "../../lib/focus-ring";
import { Avatar, AvatarFallback, AvatarImage } from "../avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu";

export type UserMenuProps = {
  name: string;
  /** Debajo del nombre ("Superadmin", el rol). En mobile se oculta. */
  subtitle?: string;
  /** Arriba del menú, para saber con qué cuenta se entró. */
  email?: string;
  avatarUrl?: string | null;
  /** aria-label del botón ("Menú de usuario"). Se anuncia junto al nombre. */
  label: string;
  /** Ítems del menú: DropdownMenuItem ("Mi perfil", "Cerrar sesión"...). */
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
};

// Iniciales: primera y última palabra ("Lucas Facundo Palacios" → "LP").
function initials(name: string) {
  const words = name.split(/\s+/).filter(Boolean);
  const picked = words.length > 1 ? [words[0], words.at(-1)!] : words;
  return picked.map((word) => word[0]?.toUpperCase()).join("");
}

// Menú de usuario de la TopBar: avatar, nombre y subtítulo; al abrirlo, el email y las acciones.
export function UserMenu({
  name,
  subtitle,
  email,
  avatarUrl,
  label,
  children,
  defaultOpen,
  className,
}: UserMenuProps) {
  return (
    <DropdownMenu defaultOpen={defaultOpen}>
      <DropdownMenuTrigger
        className={cn(
          "flex cursor-pointer items-center gap-2 rounded-md p-1 text-left transition-colors hover:bg-foreground/5 data-[state=open]:bg-foreground/5 sm:pr-2",
          focusRing,
          className,
        )}
      >
        <span className="sr-only">{label}: </span>
        <Avatar size="sm">
          {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
          <AvatarFallback>{initials(name)}</AvatarFallback>
        </Avatar>
        <span className="hidden flex-col leading-tight sm:flex">
          <span className="text-sm font-medium">{name}</span>
          {subtitle && (
            <span className="text-xs text-muted-foreground">{subtitle}</span>
          )}
        </span>
        <ChevronDown
          aria-hidden="true"
          className="hidden size-4 opacity-60 sm:block"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        {email && (
          <>
            <DropdownMenuLabel className="truncate tracking-normal normal-case">
              {email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
