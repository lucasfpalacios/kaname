import { cva, type VariantProps } from "class-variance-authority";
import { Tabs as TabsPrimitive } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";
import { focusRing } from "../../lib/focus-ring";

// Adaptado de shadcn/ui. Dos variantes: `pill` (pestañas sobre un fondo, para alternar vistas
// chicas) y `line` (subrayado, para secciones de una página). La lista pasa la variante a sus
// pestañas con data-variant.
export function Tabs({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  );
}

export const tabsListVariants = cva("group/tabs-list flex items-center", {
  variants: {
    variant: {
      pill: "h-10 w-fit gap-1 rounded-md bg-foreground/5 p-1",
      line: "h-10 w-full gap-4 border-b border-border",
    },
  },
  defaultVariants: { variant: "pill" },
});

export function TabsList({
  className,
  variant = "pill",
  ...props
}: ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  );
}

export function TabsTrigger({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex h-full cursor-pointer items-center justify-center gap-2 text-sm font-medium whitespace-nowrap text-foreground/70 transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=pill]/tabs-list:rounded-sm group-data-[variant=pill]/tabs-list:px-3 group-data-[variant=pill]/tabs-list:data-[state=active]:bg-card group-data-[variant=pill]/tabs-list:data-[state=active]:shadow-sm",
        "group-data-[variant=line]/tabs-list:-mb-px group-data-[variant=line]/tabs-list:border-b-2 group-data-[variant=line]/tabs-list:border-transparent group-data-[variant=line]/tabs-list:px-1 group-data-[variant=line]/tabs-list:data-[state=active]:border-primary",
        focusRing,
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 rounded-sm", focusRing, className)}
      {...props}
    />
  );
}
