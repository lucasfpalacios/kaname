import { ChevronRight } from "lucide-react";
import { Slot } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";
import { focusRing } from "../../lib/focus-ring";

// Adaptado del Breadcrumb de shadcn/ui. BreadcrumbLink con asChild envuelve el <Link> de la app.
export function Breadcrumbs({
  label,
  ...props
}: Omit<ComponentProps<"nav">, "aria-label"> & {
  /** aria-label del nav ("Ruta de navegación"). */
  label: string;
}) {
  return <nav data-slot="breadcrumbs" aria-label={label} {...props} />;
}

export function BreadcrumbList({ className, ...props }: ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "flex flex-wrap items-center gap-1.5 text-sm break-words text-foreground/70",
        className,
      )}
      {...props}
    />
  );
}

export function BreadcrumbItem({ className, ...props }: ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    />
  );
}

export function BreadcrumbLink({
  asChild = false,
  className,
  ...props
}: ComponentProps<"a"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "a";
  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn(
        "inline-flex items-center gap-1 rounded-sm transition-colors hover:text-foreground [&_svg]:size-4",
        focusRing,
        className,
      )}
      {...props}
    />
  );
}

// La página actual: no es link y lleva aria-current.
export function BreadcrumbPage({
  className,
  ...props
}: ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      aria-current="page"
      className={cn("font-medium text-foreground", className)}
      {...props}
    />
  );
}

export function BreadcrumbSeparator({
  className,
  ...props
}: ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      {...props}
    >
      <ChevronRight />
    </li>
  );
}
