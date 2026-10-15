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
