import type { ModuleKey } from "@kaname/shared";
import {
  Calculator,
  CalendarDays,
  ChartLine,
  FileSignature,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Package,
  Receipt,
  ShoppingCart,
  Tags,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

// Ícono de lucide de cada módulo en el sidebar (el kanji lo pone el kit).
export const MODULE_ICON: Record<ModuleKey, ReactNode> = {
  DASHBOARD: <LayoutDashboard />,
  PRODUCTS: <Package />,
  CUSTOMERS: <Users />,
  SUPPLIERS: <Truck />,
  PRICE_LISTS: <Tags />,
  CALCULATOR: <Calculator />,
  MARKET_PRICES: <TrendingUp />,
  ORDERS: <Receipt />,
  PURCHASES: <ShoppingCart />,
  DOCUMENTS: <FileText />,
  QUOTES: <FileSignature />,
  CALENDAR: <CalendarDays />,
  SOCIAL_METRICS: <ChartLine />,
  PROJECTS: <FolderKanban />,
};
