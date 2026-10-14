// Enums del dominio. Reflejan los de apps/api/prisma/schema.prisma: si cambia uno, cambiar el otro.
// Cada enum se usa como valor (Currency.ARS) y como tipo (Currency).
import { z } from "zod";

export const accountTypeSchema = z.enum(["PERSONAL", "COMPANY"]);
export const AccountType = accountTypeSchema.enum;
export type AccountType = z.infer<typeof accountTypeSchema>;

export const accountRoleSchema = z.enum(["OWNER", "MEMBER"]);
export const AccountRole = accountRoleSchema.enum;
export type AccountRole = z.infer<typeof accountRoleSchema>;

export const systemRoleKeySchema = z.enum(["OWNER", "COLLABORATOR", "CLIENT"]);
export const SystemRoleKey = systemRoleKeySchema.enum;
export type SystemRoleKey = z.infer<typeof systemRoleKeySchema>;

export const workspaceTypeSchema = z.enum(["BUSINESS", "PROJECTS"]);
export const WorkspaceType = workspaceTypeSchema.enum;
export type WorkspaceType = z.infer<typeof workspaceTypeSchema>;

export const moduleKeySchema = z.enum([
  "DASHBOARD",
  "PRODUCTS",
  "CUSTOMERS",
  "SUPPLIERS",
  "PRICE_LISTS",
  "CALCULATOR",
  "MARKET_PRICES",
  "ORDERS",
  "PURCHASES",
  "DOCUMENTS",
  "QUOTES",
  "CALENDAR",
  "SOCIAL_METRICS",
  "PROJECTS",
]);
export const ModuleKey = moduleKeySchema.enum;
export type ModuleKey = z.infer<typeof moduleKeySchema>;

export const currencySchema = z.enum(["ARS", "USD"]);
export const Currency = currencySchema.enum;
export type Currency = z.infer<typeof currencySchema>;

export const localeSchema = z.enum(["es", "en"]);
export const Locale = localeSchema.enum;
export type Locale = z.infer<typeof localeSchema>;

export const themeSchema = z.enum(["LIGHT", "DARK", "SYSTEM"]);
export const Theme = themeSchema.enum;
export type Theme = z.infer<typeof themeSchema>;

export const productKindSchema = z.enum(["FINISHED", "SUPPLY", "SERVICE"]);
export const ProductKind = productKindSchema.enum;
export type ProductKind = z.infer<typeof productKindSchema>;

export const stockMovementTypeSchema = z.enum([
  "PURCHASE",
  "SALE",
  "ADJUSTMENT",
  "RETURN",
  "PRODUCTION",
]);
export const StockMovementType = stockMovementTypeSchema.enum;
export type StockMovementType = z.infer<typeof stockMovementTypeSchema>;

export const orderStatusSchema = z.enum([
  "DRAFT",
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]);
export const OrderStatus = orderStatusSchema.enum;
export type OrderStatus = z.infer<typeof orderStatusSchema>;

export const paymentStatusSchema = z.enum([
  "UNPAID",
  "PARTIAL",
  "PAID",
  "REFUNDED",
]);
export const PaymentStatus = paymentStatusSchema.enum;
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

export const purchaseStatusSchema = z.enum([
  "DRAFT",
  "ORDERED",
  "IN_TRANSIT",
  "RECEIVED",
  "CANCELLED",
]);
export const PurchaseStatus = purchaseStatusSchema.enum;
export type PurchaseStatus = z.infer<typeof purchaseStatusSchema>;

export const quoteStatusSchema = z.enum([
  "DRAFT",
  "SENT",
  "ACCEPTED",
  "REJECTED",
  "EXPIRED",
]);
export const QuoteStatus = quoteStatusSchema.enum;
export type QuoteStatus = z.infer<typeof quoteStatusSchema>;

export const projectStatusSchema = z.enum([
  "LEAD",
  "ACTIVE",
  "PAUSED",
  "DONE",
  "CANCELLED",
]);
export const ProjectStatus = projectStatusSchema.enum;
export type ProjectStatus = z.infer<typeof projectStatusSchema>;

export const documentSourceSchema = z.enum(["UPLOADED", "GENERATED"]);
export const DocumentSource = documentSourceSchema.enum;
export type DocumentSource = z.infer<typeof documentSourceSchema>;

export const marketSourceKindSchema = z.enum(["SCRAPER", "API", "MANUAL"]);
export const MarketSourceKind = marketSourceKindSchema.enum;
export type MarketSourceKind = z.infer<typeof marketSourceKindSchema>;

export const exchangeRateTypeSchema = z.enum([
  "OFICIAL",
  "MEP",
  "TARJETA",
  "BLUE",
]);
export const ExchangeRateType = exchangeRateTypeSchema.enum;
export type ExchangeRateType = z.infer<typeof exchangeRateTypeSchema>;

export const eventTypeSchema = z.enum([
  "ORDER",
  "QUOTE",
  "POST",
  "MEETING",
  "OTHER",
]);
export const EventType = eventTypeSchema.enum;
export type EventType = z.infer<typeof eventTypeSchema>;

export const socialPlatformSchema = z.enum(["INSTAGRAM", "TIKTOK", "YOUTUBE"]);
export const SocialPlatform = socialPlatformSchema.enum;
export type SocialPlatform = z.infer<typeof socialPlatformSchema>;
