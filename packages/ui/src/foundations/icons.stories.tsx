import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Boxes,
  Calculator,
  CalendarDays,
  ChartColumn,
  FileText,
  FolderKanban,
  House,
  LayoutDashboard,
  ListOrdered,
  type LucideIcon,
  Package,
  PackagePlus,
  ReceiptText,
  ShieldCheck,
  ShoppingCart,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";
import { storyMessages } from "../stories/messages";

// Muestra de íconos de la app. El catálogo completo está en https://lucide.dev/icons.
const ICONS: { name: string; Icon: LucideIcon }[] = [
  { name: "House", Icon: House },
  { name: "LayoutDashboard", Icon: LayoutDashboard },
  { name: "Package", Icon: Package },
  { name: "Boxes", Icon: Boxes },
  { name: "Users", Icon: Users },
  { name: "Truck", Icon: Truck },
  { name: "ListOrdered", Icon: ListOrdered },
  { name: "Calculator", Icon: Calculator },
  { name: "TrendingUp", Icon: TrendingUp },
  { name: "ShoppingCart", Icon: ShoppingCart },
  { name: "PackagePlus", Icon: PackagePlus },
  { name: "FileText", Icon: FileText },
  { name: "ReceiptText", Icon: ReceiptText },
  { name: "CalendarDays", Icon: CalendarDays },
  { name: "ChartColumn", Icon: ChartColumn },
  { name: "FolderKanban", Icon: FolderKanban },
  { name: "ShieldCheck", Icon: ShieldCheck },
];

const SIZES = [16, 20, 24] as const;

function Icons({ locale }: { locale: unknown }) {
  const t = storyMessages(locale).icons;
  return (
    <section className="flex flex-col gap-8">
      <div>
        <h2 className="font-display text-2xl font-semibold">{t.title}</h2>
        <p className="text-sm opacity-70">{t.note}</p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-3">
        {ICONS.map(({ name, Icon }) => (
          <div
            key={name}
            className="flex flex-col items-center gap-2 rounded-md border border-border bg-card p-4"
          >
            <Icon size={24} strokeWidth={1.75} aria-hidden="true" />
            <span className="font-mono text-xs opacity-70">{name}</span>
          </div>
        ))}
      </div>

      <div className="flex items-end gap-6">
        {SIZES.map((size) => (
          <div key={size} className="flex flex-col items-center gap-2">
            <Package
              size={size}
              strokeWidth={1.75}
              className="text-primary"
              aria-hidden="true"
            />
            <span className="font-mono text-xs opacity-70">{size}px</span>
          </div>
        ))}
      </div>
    </section>
  );
}

const meta = {
  title: "Fundamentos/Íconos",
} satisfies Meta;

export default meta;

export const Catalogo: StoryObj = {
  name: "Catálogo",
  render: (_args, { globals }) => <Icons locale={globals.locale} />,
};
