import type { ComponentProps, ReactNode } from "react";
import { cn } from "../../lib/cn";
import { Badge } from "../badge";
import { workspaceAccentProps } from "../workspace-accent";
import { WorkspaceAvatar } from "../workspace-avatar";

// Tarjeta de un espacio en la vista General: insignia, nombre, tipo y rol, las métricas del
// espacio (o su estado vacío), los módulos activos y la acción para abrirlo. Toma el acento del
// espacio (Workspace.color).
export type WorkspaceSummaryCardProps = Omit<
  ComponentProps<"article">,
  "color" | "title"
> & {
  name: string;
  /** Tipo de espacio ("Emprendimiento"). */
  description?: string;
  /** Rol del usuario en el espacio ("Dueño"). */
  role?: string;
  initials?: string;
  color?: string | null;
  /** Métricas del espacio, o un EmptyState variant="plain" mientras no haya datos. */
  metrics?: ReactNode;
  /** Nombres de los módulos activos, ya traducidos. */
  modules?: string[];
  /** aria-label de la lista de módulos ("Módulos activos"). */
  modulesLabel?: string;
  /** Abajo a la derecha: el link "Abrir espacio" de la app. */
  action?: ReactNode;
};

export function WorkspaceSummaryCard({
  name,
  description,
  role,
  initials,
  color,
  metrics,
  modules = [],
  modulesLabel,
  action,
  className,
  style,
  ...props
}: WorkspaceSummaryCardProps) {
  const accent = workspaceAccentProps(color);
  return (
    <article
      data-slot="workspace-summary-card"
      data-workspace-accent={accent["data-workspace-accent"]}
      style={{ ...accent.style, ...style }}
      className={cn(
        "flex flex-col gap-4 rounded-lg border border-border bg-card p-5 text-foreground",
        className,
      )}
      {...props}
    >
      <header className="flex items-center gap-3">
        <WorkspaceAvatar initials={initials} size="lg" />
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="truncate font-display text-xl leading-tight font-semibold">
            {name}
          </h3>
          {(description || role) && (
            <p className="flex flex-wrap items-center gap-2 text-sm text-foreground/70">
              {description}
              {role && <Badge variant="accent">{role}</Badge>}
            </p>
          )}
        </div>
      </header>
      {metrics && <div className="rounded-md bg-background/60">{metrics}</div>}
      {modules.length > 0 && (
        <ul aria-label={modulesLabel} className="flex flex-wrap gap-2">
          {modules.map((module) => (
            <li key={module}>
              <Badge variant="secondary">{module}</Badge>
            </li>
          ))}
        </ul>
      )}
      {action && <div className="mt-auto flex justify-end">{action}</div>}
    </article>
  );
}
