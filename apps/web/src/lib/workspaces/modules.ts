import { type ModuleKey, moduleKeySchema } from "@kaname/shared";

// Segmento de URL de cada módulo dentro de un espacio: /w/[slug]/[módulo]. El resumen
// (DASHBOARD) es la raíz del espacio. Los segmentos van en inglés en los dos idiomas.
export const MODULE_SEGMENT: Record<ModuleKey, string> = {
  DASHBOARD: "",
  PRODUCTS: "products",
  CUSTOMERS: "customers",
  SUPPLIERS: "suppliers",
  PRICE_LISTS: "price-lists",
  CALCULATOR: "calculator",
  MARKET_PRICES: "market-prices",
  ORDERS: "orders",
  PURCHASES: "purchases",
  DOCUMENTS: "documents",
  QUOTES: "quotes",
  CALENDAR: "calendar",
  SOCIAL_METRICS: "social-metrics",
  PROJECTS: "projects",
};

/**
 * Fase de docs/ROADMAP.md en la que se construye cada módulo. Si el ROADMAP cambia, cambiar esto
 * (y las claves Phases.<fase> de los mensajes).
 */
export const MODULE_PHASE: Record<ModuleKey, 3 | 4 | 5 | 6 | 7> = {
  DASHBOARD: 7,
  PRODUCTS: 3,
  SUPPLIERS: 3,
  CUSTOMERS: 4,
  PRICE_LISTS: 4,
  ORDERS: 4,
  PURCHASES: 4,
  CALCULATOR: 5,
  CALENDAR: 5,
  DOCUMENTS: 5,
  QUOTES: 5,
  PROJECTS: 5,
  MARKET_PRICES: 6,
  SOCIAL_METRICS: 6,
};

/** El módulo de un segmento de URL ("price-lists" → PRICE_LISTS). El resumen no tiene segmento. */
export function moduleFromSegment(segment: string): ModuleKey | null {
  if (!segment) return null;
  return (
    moduleKeySchema.options.find((key) => MODULE_SEGMENT[key] === segment) ??
    null
  );
}

/** Ruta de un espacio por su dirección (`routeSlug`, no el slug a secas). */
export function workspacePath(slug: string, module: ModuleKey = "DASHBOARD") {
  const segment = MODULE_SEGMENT[module];
  return segment ? `/w/${slug}/${segment}` : `/w/${slug}`;
}

/** Iniciales de la insignia: "Tank Vault TCG" → "TV", "Disanza" → "DI". */
export function workspaceInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letters =
    words.length > 1 ? words[0][0] + words[1][0] : (words[0] ?? "").slice(0, 2);
  return letters.toUpperCase();
}
