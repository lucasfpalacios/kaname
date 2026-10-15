import { X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";
import { fadeInOut, popInOut } from "../../lib/motion";
import { IconButton } from "../icon-button";

// Adaptado de shadcn/ui. Se centra con inset-0 + m-auto en vez de translate, así la animación
// de escala no pisa el centrado. La X de cerrar aparece solo si se pasa `closeLabel`.
export function Dialog(props: ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

export function DialogTrigger(
  props: ComponentProps<typeof DialogPrimitive.Trigger>,
) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

export function DialogPortal(
  props: ComponentProps<typeof DialogPrimitive.Portal>,
) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

export function DialogClose(
  props: ComponentProps<typeof DialogPrimitive.Close>,
) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

// Negro fijo en los dos temas: con un token del tema el velo quedaría claro en oscuro.
export function DialogOverlay({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn("fixed inset-0 z-50 bg-black/50", fadeInOut, className)}
      {...props}
    />
  );
}

export type DialogContentProps = ComponentProps<
  typeof DialogPrimitive.Content
> & {
  /** aria-label del botón X. Sin él no se muestra la X. */
  closeLabel?: string;
};

export function DialogContent({
  className,
  children,
  closeLabel,
  ...props
}: DialogContentProps) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "fixed inset-0 z-50 m-auto flex h-fit max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg flex-col gap-4 overflow-y-auto rounded-lg border border-border bg-card p-6 text-foreground shadow-lg outline-none",
          popInOut,
          className,
        )}
        {...props}
      >
        {children}
        {closeLabel && <CloseButton label={closeLabel} />}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

// También la usa Sheet.
export function CloseButton({ label }: { label: string }) {
  return (
    <DialogPrimitive.Close asChild>
      <IconButton label={label} size="sm" className="absolute top-4 right-4">
        <X />
      </IconButton>
    </DialogPrimitive.Close>
  );
}

// pr-8 deja lugar a la X.
export function DialogHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-1.5 pr-8", className)}
      {...props}
    />
  );
}

export function DialogFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

export function DialogTitle({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "font-display text-xl leading-tight font-semibold",
        className,
      )}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm text-foreground/70", className)}
      {...props}
    />
  );
}
