"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from "lucide-react";
import { Toast as ToastPrimitive } from "radix-ui";
import { type ComponentProps, useSyncExternalStore } from "react";
import { cn } from "../../lib/cn";
import { enterExit } from "../../lib/motion";
import { buttonVariants } from "../button";
import { IconButton } from "../icon-button";

// Adaptado del Toast de shadcn/ui (Radix). Dos formas de usarlo:
// - Imperativa: un <Toaster> en el layout y `toast({ ... })` desde cualquier lado.
// - Declarativa: ToastProvider + Toast + ToastViewport, para casos a medida.
// Como en los badges, el texto va en foreground y el color del estado en el borde y el ícono.

export const ToastProvider = ToastPrimitive.Provider;

export function ToastViewport({
  className,
  ...props
}: ComponentProps<typeof ToastPrimitive.Viewport>) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        "fixed right-0 bottom-0 z-[100] flex max-h-dvh w-full flex-col-reverse gap-2 p-4 outline-none sm:max-w-sm",
        className,
      )}
      {...props}
    />
  );
}

export const toastVariants = cva(
  [
    "group pointer-events-auto relative flex w-full items-start gap-3 rounded-md border border-l-4 p-4 pr-12 text-sm text-foreground shadow-lg",
    enterExit,
    "[--kaname-enter-x:100%] [--kaname-exit-opacity:0]",
    "data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-transform data-[swipe=move]:translate-x-(--radix-toast-swipe-move-x)",
    "data-[swipe=end]:[--kaname-exit-x:var(--radix-toast-swipe-end-x)] motion-safe:data-[swipe=end]:animate-exit",
  ],
  {
    variants: {
      variant: {
        default: "border-border border-l-primary bg-card",
        success: "border-success bg-success-soft",
        warning: "border-warning bg-warning-soft",
        destructive: "border-destructive bg-destructive-soft",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export type ToastVariant = NonNullable<
  VariantProps<typeof toastVariants>["variant"]
>;

const icons = {
  default: { Icon: Info, className: "text-primary" },
  success: { Icon: CircleCheck, className: "text-success" },
  warning: { Icon: TriangleAlert, className: "text-warning" },
  destructive: { Icon: CircleAlert, className: "text-destructive" },
} satisfies Record<ToastVariant, unknown>;

// Los errores se anuncian con prioridad (type="foreground"); el resto, sin interrumpir.
export function Toast({
  className,
  variant,
  children,
  ...props
}: ComponentProps<typeof ToastPrimitive.Root> &
  VariantProps<typeof toastVariants>) {
  const { Icon, className: iconClassName } = icons[variant ?? "default"];
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      type={variant === "destructive" ? "foreground" : "background"}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    >
      <Icon
        aria-hidden="true"
        className={cn("mt-0.5 size-4 shrink-0", iconClassName)}
      />
      <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
        {children}
      </div>
    </ToastPrimitive.Root>
  );
}

export function ToastTitle({
  className,
  ...props
}: ComponentProps<typeof ToastPrimitive.Title>) {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn("font-medium", className)}
      {...props}
    />
  );
}

export function ToastDescription({
  className,
  ...props
}: ComponentProps<typeof ToastPrimitive.Description>) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn("text-foreground/80", className)}
      {...props}
    />
  );
}

// altText describe la acción para quien usa lector de pantalla (Radix lo exige).
export function ToastAction({
  className,
  ...props
}: ComponentProps<typeof ToastPrimitive.Action>) {
  return (
    <ToastPrimitive.Action
      data-slot="toast-action"
      className={cn(
        buttonVariants({ variant: "secondary", size: "sm" }),
        "mt-2",
        className,
      )}
      {...props}
    />
  );
}

export function ToastClose({ label }: { label: string }) {
  return (
    <ToastPrimitive.Close asChild>
      <IconButton
        label={label}
        size="sm"
        className="absolute top-2.5 right-2.5"
      >
        <X />
      </IconButton>
    </ToastPrimitive.Close>
  );
}

// --- Forma imperativa ---

export type ToastOptions = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  /** En milisegundos. Por defecto, el de Toaster. */
  duration?: number;
  action?: { label: string; altText?: string; onClick: () => void };
};

type ToastItem = ToastOptions & { id: number; open: boolean };

// Lo que tarda la animación de salida (--animate-exit) antes de sacarlo de la lista.
const REMOVE_DELAY = 200;
const EMPTY: ToastItem[] = [];

let items: ToastItem[] = EMPTY;
let nextId = 0;
const listeners = new Set<() => void>();

function setItems(next: ToastItem[]) {
  items = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Muestra un toast y devuelve su id, para cerrarlo con `dismissToast`. */
export function toast(options: ToastOptions): number {
  const id = ++nextId;
  setItems([...items, { ...options, id, open: true }]);
  return id;
}

export function dismissToast(id: number) {
  setItems(
    items.map((item) => (item.id === id ? { ...item, open: false } : item)),
  );
  setTimeout(
    () => setItems(items.filter((item) => item.id !== id)),
    REMOVE_DELAY,
  );
}

export type ToasterProps = {
  /** Prefijo que anuncia el lector de pantalla en cada toast ("Notificación"). */
  label: string;
  /** aria-label de la región; `{hotkey}` se reemplaza por el atajo (F8). */
  viewportLabel: string;
  /** aria-label del botón de cerrar. */
  closeLabel: string;
  duration?: number;
};

export function Toaster({
  label,
  viewportLabel,
  closeLabel,
  duration = 5000,
}: ToasterProps) {
  const toasts = useSyncExternalStore(
    subscribe,
    () => items,
    () => EMPTY,
  );
  return (
    <ToastProvider label={label} duration={duration} swipeDirection="right">
      {toasts.map((item) => (
        <Toast
          key={item.id}
          open={item.open}
          onOpenChange={(open) => {
            if (!open) dismissToast(item.id);
          }}
          variant={item.variant}
          duration={item.duration}
        >
          <ToastTitle>{item.title}</ToastTitle>
          {item.description && (
            <ToastDescription>{item.description}</ToastDescription>
          )}
          {item.action && (
            <ToastAction
              altText={item.action.altText ?? item.action.label}
              onClick={item.action.onClick}
            >
              {item.action.label}
            </ToastAction>
          )}
          <ToastClose label={closeLabel} />
        </Toast>
      ))}
      <ToastViewport label={viewportLabel} />
    </ToastProvider>
  );
}
