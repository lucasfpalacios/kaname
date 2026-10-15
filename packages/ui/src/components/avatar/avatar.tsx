import { cva, type VariantProps } from "class-variance-authority";
import { Avatar as AvatarPrimitive } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

// Adaptado de shadcn/ui. El tamaño va en la raíz y el fallback lo hereda.
const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full select-none",
  {
    variants: {
      size: {
        sm: "size-8 text-xs",
        md: "size-10 text-sm",
        lg: "size-12 text-base",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export type AvatarProps = ComponentProps<typeof AvatarPrimitive.Root> &
  VariantProps<typeof avatarVariants>;

export function Avatar({ className, size, ...props }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(avatarVariants({ size }), className)}
      {...props}
    />
  );
}

export function AvatarImage({
  className,
  ...props
}: ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full object-cover", className)}
      {...props}
    />
  );
}

// Iniciales o ícono cuando no hay imagen o todavía no cargó.
export function AvatarFallback({
  className,
  ...props
}: ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center bg-accent-soft font-medium text-foreground",
        className,
      )}
      {...props}
    />
  );
}
