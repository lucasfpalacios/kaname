import { cva, type VariantProps } from "class-variance-authority";
import { Dialog as DialogPrimitive } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";
import { enterExit } from "../../lib/motion";
import { CloseButton, DialogOverlay, DialogPortal } from "../dialog/dialog";

// Adaptado de shadcn/ui: drawer lateral sobre el Dialog de Radix. El contenido largo va en
// SheetBody, que scrollea entre el header y el footer fijos.
export function Sheet(props: ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="sheet" {...props} />;
}

export function SheetTrigger(
  props: ComponentProps<typeof DialogPrimitive.Trigger>,
) {
  return <DialogPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

export function SheetClose(
  props: ComponentProps<typeof DialogPrimitive.Close>,
) {
  return <DialogPrimitive.Close data-slot="sheet-close" {...props} />;
}

export const sheetVariants = cva(
  [
    "fixed z-50 flex flex-col border-border bg-card text-foreground shadow-lg outline-none",
    enterExit,
  ],
  {
    variants: {
      side: {
        right:
          "inset-y-0 right-0 w-full border-l [--kaname-enter-x:100%] [--kaname-exit-x:100%] sm:max-w-md",
        left: "inset-y-0 left-0 w-full border-r [--kaname-enter-x:-100%] [--kaname-exit-x:-100%] sm:max-w-md",
        top: "inset-x-0 top-0 max-h-[85dvh] border-b [--kaname-enter-y:-100%] [--kaname-exit-y:-100%]",
        bottom:
          "inset-x-0 bottom-0 max-h-[85dvh] border-t [--kaname-enter-y:100%] [--kaname-exit-y:100%]",
      },
    },
    defaultVariants: { side: "right" },
  },
);

export type SheetContentProps = ComponentProps<typeof DialogPrimitive.Content> &
  VariantProps<typeof sheetVariants> & {
    /** aria-label del botón X. Sin él no se muestra la X. */
    closeLabel?: string;
  };

export function SheetContent({
  className,
  children,
  side,
  closeLabel,
  ...props
}: SheetContentProps) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="sheet-content"
        className={cn(sheetVariants({ side }), className)}
        {...props}
      >
        {children}
        {closeLabel && <CloseButton label={closeLabel} />}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

export function SheetHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-6 pr-14", className)}
      {...props}
    />
  );
}

export function SheetBody({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-body"
      className={cn("min-h-0 flex-1 overflow-y-auto px-6", className)}
      {...props}
    />
  );
}

export function SheetFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn(
        "mt-auto flex flex-col-reverse gap-2 p-6 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

export function SheetTitle({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="sheet-title"
      className={cn(
        "font-display text-xl leading-tight font-semibold",
        className,
      )}
      {...props}
    />
  );
}

export function SheetDescription({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-foreground/70", className)}
      {...props}
    />
  );
}
