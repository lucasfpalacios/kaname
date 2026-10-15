import type {
  OrderStatusKey,
  PaymentStatusKey,
} from "../components/status-badge";

// Datos de ejemplo de Tank Vault TCG para las stories (la pantalla tank_vault de Stitch).
// Los montos van como en la API: string decimal para mostrar y number solo para graficar.

// Ventas por mes en ARS, mayo a octubre 2026: 68 % envíos nacionales, 32 % ventas locales.
export const monthlySales = [
  { national: 2108000, local: 992000 },
  { national: 2346000, local: 1104000 },
  { national: 2652000, local: 1248000 },
  { national: 2822000, local: 1328000 },
  { national: 2924000, local: 1376000 },
  { national: 3141600, local: 1478400 },
];

export const averageTicket = [74500, 76800, 79200, 80100, 81300, 82500];

// Importaciones en USD por mes.
export const monthlyImports = [
  { sealed: 1800, singles: 600 },
  { sealed: 2100, singles: 450 },
  { sealed: 1650, singles: 700 },
  { sealed: 2400, singles: 820 },
  { sealed: 2250, singles: 900 },
  { sealed: 2600, singles: 1050 },
];

export type TankVaultOrder = {
  id: string;
  customer: string;
  product: string;
  total: string;
  createdAt: string;
  status: OrderStatusKey;
  payment: PaymentStatusKey;
};

export const recentOrders: TankVaultOrder[] = [
  {
    id: "#TK-1084",
    customer: "Martín Gómez",
    product: "Surging Sparks Booster Box",
    total: "345000",
    createdAt: "2026-10-15T17:32:00Z",
    status: "PREPARING",
    payment: "PAID",
  },
  {
    id: "#TK-1083",
    customer: "Facundo López",
    product: "151 Elite Trainer Box",
    total: "118000",
    createdAt: "2026-10-15T14:15:00Z",
    status: "CONFIRMED",
    payment: "PAID",
  },
  {
    id: "#TK-1082",
    customer: "Sofía Rossi",
    product: "Prismatic Evolutions 6x Boosters",
    total: "85000",
    createdAt: "2026-10-14T21:40:00Z",
    status: "SHIPPED",
    payment: "PARTIAL",
  },
  {
    id: "#TK-1081",
    customer: "Nicolás Álvarez",
    product: "Twilight Masquerade Booster Box",
    total: "240000",
    createdAt: "2026-10-14T19:05:00Z",
    status: "DELIVERED",
    payment: "PAID",
  },
  {
    id: "#TK-1080",
    customer: "Joaquín Peralta",
    product: "Paldean Fates 3-Blister Pack",
    total: "92500",
    createdAt: "2026-10-13T23:12:00Z",
    status: "PENDING",
    payment: "UNPAID",
  },
  {
    id: "#TK-1079",
    customer: "Valentina Ruiz",
    product: "Charizard ex SAR (PSA 10)",
    total: "145000",
    createdAt: "2026-10-12T15:48:00Z",
    status: "CANCELLED",
    payment: "REFUNDED",
  },
];

export const TIME_ZONE = "America/Argentina/Buenos_Aires";

export type ProductCategoryKey =
  "boosterBox" | "etb" | "singles" | "packs" | "accessories";

export type TankVaultProduct = {
  id: string;
  name: string;
  sku: string;
  /** Iniciales para la miniatura (las stories no cargan imágenes). */
  initials: string;
  category: ProductCategoryKey;
  stock: number;
  /** Punto de reorden: con stock menor o igual, el stock está bajo. */
  reorderPoint: number;
  /** Costo y precio en ARS, como string decimal. */
  cost: string;
  price: string;
  supplier: string;
};

// Catálogo de la pantalla productos de Stitch, ampliado para que haya varias páginas.
export const products: TankVaultProduct[] = [
  {
    id: "p01",
    name: "Booster Box Surging Sparks (36 sobres)",
    sku: "PKM-SV8-BB-EN",
    initials: "SSP",
    category: "boosterBox",
    stock: 2,
    reorderPoint: 10,
    cost: "201300",
    price: "345000",
    supplier: "GTS Distribution",
  },
  {
    id: "p02",
    name: "Elite Trainer Box Pokémon 151",
    sku: "PKM-151-ETB-EN",
    initials: "151",
    category: "etb",
    stock: 3,
    reorderPoint: 8,
    cost: "76700",
    price: "118000",
    supplier: "GTS Distribution",
  },
  {
    id: "p03",
    name: "Charizard ex Special Art Rare #199/165",
    sku: "SNG-151-199-NM",
    initials: "SAR",
    category: "singles",
    stock: 1,
    reorderPoint: 1,
    cost: "98000",
    price: "145000",
    supplier: "Colección propia",
  },
  {
    id: "p04",
    name: "Pack 6x sobres Prismatic Evolutions",
    sku: "PKM-PRE-6BP",
    initials: "PRE",
    category: "packs",
    stock: 24,
    reorderPoint: 10,
    cost: "52700",
    price: "85000",
    supplier: "Phoenix Imports",
  },
  {
    id: "p05",
    name: "Booster Box Twilight Masquerade",
    sku: "PKM-TWM-BB-EN",
    initials: "TWM",
    category: "boosterBox",
    stock: 8,
    reorderPoint: 6,
    cost: "148800",
    price: "240000",
    supplier: "GTS Distribution",
  },
  {
    id: "p06",
    name: "Fundas Dragon Shield Matte Dual (100 u.)",
    sku: "ACC-DS-DUAL-BK",
    initials: "DS",
    category: "accessories",
    stock: 5,
    reorderPoint: 15,
    cost: "14500",
    price: "24000",
    supplier: "Arcane Tinmen",
  },
  {
    id: "p07",
    name: "Paldean Fates 3-Blister Pack",
    sku: "PKM-PAF-3BL",
    initials: "PAF",
    category: "packs",
    stock: 18,
    reorderPoint: 6,
    cost: "57400",
    price: "92500",
    supplier: "Phoenix Imports",
  },
  {
    id: "p08",
    name: "Elite Trainer Box Stellar Crown",
    sku: "PKM-SCR-ETB-EN",
    initials: "SCR",
    category: "etb",
    stock: 11,
    reorderPoint: 5,
    cost: "71200",
    price: "112000",
    supplier: "GTS Distribution",
  },
  {
    id: "p09",
    name: "Pikachu Grey Felt Hat (PSA 9)",
    sku: "SNG-SVP-085-P9",
    initials: "PIK",
    category: "singles",
    stock: 1,
    reorderPoint: 0,
    cost: "61000",
    price: "98000",
    supplier: "Colección propia",
  },
  {
    id: "p10",
    name: "Booster Box Stellar Crown",
    sku: "PKM-SCR-BB-EN",
    initials: "SCB",
    category: "boosterBox",
    stock: 6,
    reorderPoint: 4,
    cost: "182000",
    price: "289000",
    supplier: "GTS Distribution",
  },
  {
    id: "p11",
    name: "Deck box Ultra Pro Alcove Flip",
    sku: "ACC-UP-ALC-BL",
    initials: "UP",
    category: "accessories",
    stock: 32,
    reorderPoint: 10,
    cost: "9800",
    price: "16500",
    supplier: "Ultra Pro",
  },
  {
    id: "p12",
    name: "Sobre suelto Surging Sparks",
    sku: "PKM-SV8-BP-EN",
    initials: "SS1",
    category: "packs",
    stock: 74,
    reorderPoint: 36,
    cost: "6400",
    price: "10500",
    supplier: "GTS Distribution",
  },
  {
    id: "p13",
    name: "Umbreon VMAX Alt Art #215/203",
    sku: "SNG-EVS-215-NM",
    initials: "UMB",
    category: "singles",
    stock: 1,
    reorderPoint: 0,
    cost: "720000",
    price: "1150000",
    supplier: "Colección propia",
  },
  {
    id: "p14",
    name: "Playmat Pokémon Center Eevee",
    sku: "ACC-PC-PMT-EV",
    initials: "PMT",
    category: "accessories",
    stock: 4,
    reorderPoint: 3,
    cost: "21000",
    price: "36000",
    supplier: "Arcane Tinmen",
  },
];
