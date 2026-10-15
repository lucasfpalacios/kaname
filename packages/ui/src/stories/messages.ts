import type { ModuleKanjiKey } from "../components/module-kanji";

// Textos de las stories. El kit no traduce: en la app los textos entran por props desde
// next-intl; acá salen de este diccionario según el idioma elegido en la barra de Storybook.
export type StoryLocale = "es" | "en";

export const toStoryLocale = (value: unknown): StoryLocale =>
  value === "en" ? "en" : "es";

const es = {
  light: "Claro",
  dark: "Oscuro",
  colors: {
    background: "Fondo",
    card: "Tarjeta / superficie",
    border: "Borde",
    foreground: "Texto",
    primary: "Primario",
    "primary-foreground": "Texto sobre primario",
    accent: "Acento",
    "accent-soft": "Acento suave",
    success: "Éxito",
    "success-soft": "Éxito (fondo)",
    warning: "Advertencia",
    "warning-soft": "Advertencia (fondo)",
    destructive: "Error",
    "destructive-soft": "Error (fondo)",
  },
  typography: {
    display: "Display: Shippori Mincho B1",
    displayNote:
      "Solo títulos, desde 18px. 800 para h1; 600 para h2, h3 y nombres de espacio.",
    sans: "Interfaz: Zen Kaku Gothic New",
    sansNote: "Todo lo demás: interfaz, tablas, formularios, botones, KPIs.",
    sample: "Gestioná todos tus negocios",
    label: "Etiqueta",
    labelNote: "Mayúsculas con tracking-label (0.08em)",
    numbers: "Números tabulares",
  },
  radii: {
    title: "Radios",
    note: "Entre 8 y 12px. Bordes sutiles, sombras mínimas.",
  },
  spacing: {
    title: "Espaciados",
    note: "Escala de Tailwind: cada paso es 0.25rem (4px).",
  },
  icons: {
    title: "Íconos (lucide-react)",
    note: "Trazo de 1.75 y tamaño 16, 20 o 24px. Color heredado del texto.",
  },
  modules: {
    GENERAL: "General",
    DASHBOARD: "Resumen",
    PRODUCTS: "Productos",
    STOCK: "Stock",
    CUSTOMERS: "Clientes",
    SUPPLIERS: "Proveedores",
    PRICE_LISTS: "Listas de precios",
    CALCULATOR: "Calculadora",
    MARKET_PRICES: "Precios de mercado",
    ORDERS: "Pedidos / ventas",
    PURCHASES: "Compras",
    DOCUMENTS: "Documentos",
    QUOTES: "Presupuestos",
    CALENDAR: "Calendario",
    SOCIAL_METRICS: "Métricas de redes",
    PROJECTS: "Proyectos",
    ADMIN: "Administración",
  } satisfies Record<ModuleKanjiKey, string>,
};

type Messages = typeof es;

const en: Messages = {
  light: "Light",
  dark: "Dark",
  colors: {
    background: "Background",
    card: "Card / surface",
    border: "Border",
    foreground: "Text",
    primary: "Primary",
    "primary-foreground": "Text on primary",
    accent: "Accent",
    "accent-soft": "Soft accent",
    success: "Success",
    "success-soft": "Success (background)",
    warning: "Warning",
    "warning-soft": "Warning (background)",
    destructive: "Error",
    "destructive-soft": "Error (background)",
  },
  typography: {
    display: "Display: Shippori Mincho B1",
    displayNote:
      "Headings only, 18px and up. 800 for h1; 600 for h2, h3 and space names.",
    sans: "Interface: Zen Kaku Gothic New",
    sansNote: "Everything else: interface, tables, forms, buttons, KPIs.",
    sample: "Manage all your businesses",
    label: "Label",
    labelNote: "Uppercase with tracking-label (0.08em)",
    numbers: "Tabular numbers",
  },
  radii: {
    title: "Radii",
    note: "Between 8 and 12px. Subtle borders, minimal shadows.",
  },
  spacing: {
    title: "Spacing",
    note: "Tailwind scale: each step is 0.25rem (4px).",
  },
  icons: {
    title: "Icons (lucide-react)",
    note: "1.75 stroke, 16, 20 or 24px. Color inherited from text.",
  },
  modules: {
    GENERAL: "General",
    DASHBOARD: "Overview",
    PRODUCTS: "Products",
    STOCK: "Stock",
    CUSTOMERS: "Customers",
    SUPPLIERS: "Suppliers",
    PRICE_LISTS: "Price lists",
    CALCULATOR: "Calculator",
    MARKET_PRICES: "Market prices",
    ORDERS: "Orders / sales",
    PURCHASES: "Purchases",
    DOCUMENTS: "Documents",
    QUOTES: "Quotes",
    CALENDAR: "Calendar",
    SOCIAL_METRICS: "Social metrics",
    PROJECTS: "Projects",
    ADMIN: "Administration",
  },
};

export const storyMessages = (locale: unknown): Messages =>
  toStoryLocale(locale) === "en" ? en : es;
