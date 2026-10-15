import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "../../lib/cn";
import { workspaceAccentProps } from "../workspace-accent";

// Insignia cuadrada de un espacio ("TV"). Toma el acento del espacio: fondo suave y borde en el
// color, texto en foreground (el color del usuario puede no tener contraste como texto).
const workspaceAvatarVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-md border border-accent bg-accent-soft font-sans font-bold text-foreground select-none [&_svg]:size-1/2",
  {
    variants: {
      size: {
        sm: "size-8 text-xs",
        md: "size-10 text-sm",
        lg: "size-12 text-base",
        xl: "size-16 text-xl",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export type WorkspaceAvatarProps = Omit<
  ComponentProps<"span">,
  "children" | "color"
> &
  VariantProps<typeof workspaceAvatarVariants> & {
    /** Iniciales ("TV"). Se ignoran si hay `icon`. */
    initials?: string;
    /** Ícono en lugar de iniciales (por ejemplo el de General). */
    icon?: ReactNode;
    /** Workspace.color. Sin él usa el acento del contenedor. */
    color?: string | null;
  };

// Decorativo: el nombre del espacio siempre está al lado.
export function WorkspaceAvatar({
  initials,
  icon,
  color,
  size,
  className,
  style,
  ...props
}: WorkspaceAvatarProps) {
  const accent = workspaceAccentProps(color);
  return (
    <span
      aria-hidden="true"
      data-slot="workspace-avatar"
      data-workspace-accent={accent["data-workspace-accent"]}
      style={{ ...accent.style, ...style }}
      className={cn(workspaceAvatarVariants({ size }), className)}
      {...props}
    >
      {icon ?? initials}
    </span>
  );
}
