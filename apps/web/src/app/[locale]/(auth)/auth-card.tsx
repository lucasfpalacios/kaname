import { Card, KanameLogo, Skeleton } from "@kaname/ui";
import type { ReactNode } from "react";

// Tarjeta de las pantallas de login y registro: logo grande, título, subtítulo y el formulario.
export function AuthCard({
  product,
  title,
  subtitle,
  children,
  footer,
}: {
  product: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Card className="w-full max-w-md gap-8 px-6 py-10 shadow-sm sm:px-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <KanameLogo name={product} size="lg" markOnly />
        <h1 className="font-display text-2xl font-extrabold">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {children}
      {footer && (
        <p className="text-center text-sm text-muted-foreground">{footer}</p>
      )}
    </Card>
  );
}

export function AuthCardSkeleton() {
  return (
    <Card aria-busy className="w-full max-w-md gap-6 px-6 py-10 sm:px-10">
      <Skeleton className="mx-auto size-14" />
      <Skeleton className="mx-auto h-7 w-40" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </Card>
  );
}
