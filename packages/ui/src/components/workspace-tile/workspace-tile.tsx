import { cva, type VariantProps } from "class-variance-authority";
import { Plus } from "lucide-react";
import { Slot } from "radix-ui";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "../../lib/cn";
import { focusRing } from "../../lib/focus-ring";
import { Badge } from "../badge";
import { workspaceAccentProps } from "../workspace-accent";
import { WorkspaceAvatar } from "../workspace-avatar";

// Botón grande del launcher (pantalla de inicio): un espacio, "General" o "Crear espacio".
// Con asChild envuelve el link de la app (<Link href>), así sirve desde un Server Component.
const workspaceTileVariants = cva(
  [
    "group/tile relative flex min-h-44 flex-col justify-between gap-6 rounded-lg border p-5 text-left text-foreground transition-colors",
    "hover:border-accent",
    focusRing,
  ],
  {
    variants: {
      variant: {
        workspace: "border-border bg-card",
        create:
          "items-center justify-center border-dashed border-border bg-transparent text-center hover:bg-card",
      },
      selected: {
        true: "border-accent ring-1 ring-accent",
        false: "",
      },
    },
    defaultVariants: { variant: "workspace", selected: false },
  },
);

export type WorkspaceTileProps = Omit<
  ComponentProps<"button">,
  "children" | "color"
> &
  VariantProps<typeof workspaceTileVariants> & {
    name: string;
    /** Tipo o descripción ("Emprendimiento", "Panel consolidado"). */
    description?: string;
    initials?: string;
    /** Ícono en lugar de iniciales (General). */
    icon?: ReactNode;
    /** Workspace.color. */
    color?: string | null;
    /** Arriba a la derecha ("3 pend.", "Global"). */
    badge?: string;
    asChild?: boolean;
    children?: ReactNode;
  };

export function WorkspaceTile({
  variant = "workspace",
  selected,
  name,
  description,
  initials,
  icon,
  color,
  badge,
  asChild = false,
  className,
  style,
  children,
  ...props
}: WorkspaceTileProps) {
  const Comp = asChild ? Slot.Root : "button";
  const accent = workspaceAccentProps(color);
  const content =
    variant === "create" ? (
      <>
        <span
          aria-hidden="true"
          className="flex size-12 items-center justify-center rounded-full border border-border bg-card text-primary transition-colors group-hover/tile:border-accent"
        >
          <Plus className="size-6" />
        </span>
        <span className="flex flex-col gap-1">
          <span className="font-display text-lg font-semibold">{name}</span>
          {description && (
            <span className="text-sm text-foreground/70">{description}</span>
          )}
        </span>
      </>
    ) : (
      <>
        <span className="flex items-start justify-between gap-3">
          <WorkspaceAvatar initials={initials} icon={icon} size="lg" />
          {badge && <Badge variant="accent">{badge}</Badge>}
        </span>
        <span className="flex flex-col gap-1">
          <span className="font-display text-xl leading-tight font-semibold">
            {name}
          </span>
          {description && (
            <span className="text-sm text-foreground/70">{description}</span>
          )}
        </span>
      </>
    );
  return (
    <Comp
      data-slot="workspace-tile"
      data-workspace-accent={accent["data-workspace-accent"]}
      style={{ ...accent.style, ...style }}
      className={cn(workspaceTileVariants({ variant, selected }), className)}
      {...(asChild ? {} : { type: "button" as const })}
      {...props}
    >
      {/* Con asChild, el link de la app (<Link href />) recibe el contenido de la tile. */}
      {asChild && <Slot.Slottable>{children}</Slot.Slottable>}
      {content}
    </Comp>
  );
}
