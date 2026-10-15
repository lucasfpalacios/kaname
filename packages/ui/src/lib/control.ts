import { focusRing } from "./focus-ring";

// Base común de los campos de texto y los disparadores (Input, Select, Combobox, DatePicker...).
// El error se marca con aria-invalid, que pone FormField.
export const controlBase = [
  "flex h-10 w-full min-w-0 items-center rounded-md border border-border bg-card px-3 text-sm text-foreground transition-colors",
  "placeholder:text-foreground/55",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive",
  focusRing,
].join(" ");

// Contenido flotante (Popover, Select, Combobox): superficie con borde y una sombra mínima.
export const floatingSurface =
  "z-50 rounded-md border border-border bg-card text-foreground shadow-md outline-none";

// Campo con adornos (moneda, "%"): el borde, el foco y el error van en el contenedor y el
// <input> de adentro queda sin estilos propios.
export const controlGroup = [
  "flex h-10 w-full min-w-0 items-center overflow-hidden rounded-md border border-border bg-card text-sm text-foreground transition-colors",
  "focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-background",
  "has-aria-invalid:border-destructive has-aria-invalid:focus-within:ring-destructive",
  "has-disabled:cursor-not-allowed has-disabled:opacity-50",
].join(" ");

export const controlGroupInput =
  "h-full w-full min-w-0 bg-transparent px-3 outline-none placeholder:text-foreground/55 disabled:cursor-not-allowed";
