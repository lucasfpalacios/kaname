import type { ComponentProps, ReactNode } from "react";
import { cn } from "../../lib/cn";
import { ModuleKanji, type ModuleKanjiKey } from "../module-kanji";

export type PageHeaderProps = Omit<ComponentProps<"header">, "title"> & {
  title: string;
  description?: ReactNode;
  /** Kanji del módulo al lado del título (decorativo). */
  module?: ModuleKanjiKey;
  /** Breadcrumbs arriba del título. */
  breadcrumbs?: ReactNode;
  /** A la izquierda del título (el WorkspaceAvatar del espacio). */
  leading?: ReactNode;
  /** Al lado del título (un Badge). */
  badge?: ReactNode;
  /** Botones a la derecha. */
  actions?: ReactNode;
};

// Encabezado de página: el único h1. Título en display (Shippori Mincho B1, 800).
export function PageHeader({
  title,
  description,
  module,
  breadcrumbs,
  leading,
  badge,
  actions,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <header
      data-slot="page-header"
      className={cn("flex flex-col gap-3", className)}
      {...props}
    >
      {breadcrumbs}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex min-w-0 flex-1 basis-64 items-center gap-4">
          {leading}
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h1 className="font-display text-2xl leading-tight font-extrabold md:text-3xl">
                {title}
              </h1>
              {module && <ModuleKanji module={module} size="md" />}
              {badge}
            </div>
            {description && (
              <p className="text-sm text-foreground/70">{description}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        )}
      </div>
    </header>
  );
}
