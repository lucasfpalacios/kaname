"use client";

import type { CategorySummary } from "@kaname/shared";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { useMemo } from "react";
import { intlLocale, type Locale } from "@/i18n/routing";
import { catalogKeys, listCategories } from "@/lib/catalog/api";

/** Categorías del espacio (las usan los filtros, el formulario y el diálogo de categorías). */
export function useCategories(workspaceId: string) {
  return useQuery({
    queryKey: catalogKeys.categories(workspaceId),
    queryFn: () => listCategories(workspaceId),
  });
}

/** Después de cambiar algo del catálogo: listado, detalles, categorías y movimientos se recargan. */
export function useRefreshCatalog(workspaceId: string) {
  const client = useQueryClient();
  return () =>
    client.invalidateQueries({ queryKey: catalogKeys.all(workspaceId) });
}

/** Locale de Intl (es-AR / en-US) y formato de cantidades de stock ("2", "1,5"). */
export function useCatalogFormat() {
  const locale = intlLocale[useLocale() as Locale];
  return useMemo(() => {
    const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 3 });
    return {
      locale,
      quantity: (value: string) => number.format(Number(value)),
    };
  }, [locale]);
}

/**
 * Categorías para un select: cada principal seguida de sus subcategorías ("Sellado › ETBs"), en
 * orden alfabético dentro de cada nivel (la API ya las manda por nombre).
 */
export function categoryOptions(categories: CategorySummary[]) {
  return categories
    .filter((category) => !category.parentId)
    .flatMap((root) => [
      { value: root.id, label: root.name },
      ...categories
        .filter((category) => category.parentId === root.id)
        .map((child) => ({
          value: child.id,
          label: `${root.name} › ${child.name}`,
        })),
    ]);
}
