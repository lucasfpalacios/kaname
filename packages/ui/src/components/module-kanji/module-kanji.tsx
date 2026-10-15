import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

// Tabla de docs/design/tokens.md. Las claves son las de ModuleKey (@kaname/shared) más las
// secciones que no son módulos activables: General, Stock y Administración.
export const MODULE_KANJI = {
  GENERAL: "総合",
  DASHBOARD: "概要",
  PRODUCTS: "商品",
  STOCK: "在庫",
  CUSTOMERS: "顧客",
  SUPPLIERS: "仕入先",
  PRICE_LISTS: "価格表",
  CALCULATOR: "計算",
  MARKET_PRICES: "相場",
  ORDERS: "注文",
  PURCHASES: "仕入",
  DOCUMENTS: "書類",
  QUOTES: "見積",
  CALENDAR: "予定",
  SOCIAL_METRICS: "指標",
  PROJECTS: "案件",
  ADMIN: "管理",
} as const;

export type ModuleKanjiKey = keyof typeof MODULE_KANJI;

const moduleKanjiVariants = cva(
  "inline-block shrink-0 font-display font-semibold leading-none whitespace-nowrap text-accent select-none",
  {
    variants: {
      size: {
        sm: "text-base",
        md: "text-xl",
        lg: "text-3xl",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export type ModuleKanjiProps = Omit<ComponentProps<"span">, "children"> &
  VariantProps<typeof moduleKanjiVariants> & {
    module: ModuleKanjiKey;
  };

// Acento decorativo: acompaña al nombre del módulo, nunca lo reemplaza. Por eso aria-hidden.
export function ModuleKanji({
  module,
  size,
  className,
  ...props
}: ModuleKanjiProps) {
  return (
    <span
      aria-hidden="true"
      lang="ja"
      className={cn(moduleKanjiVariants({ size }), className)}
      {...props}
    >
      {MODULE_KANJI[module]}
    </span>
  );
}
