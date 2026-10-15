import type { Meta, StoryObj } from "@storybook/react-vite";
import { storyMessages } from "../../stories/messages";
import { Badge } from "../badge";
import { Button } from "../button";
import { Separator } from "../separator";
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";

const SIDES = ["right", "left", "top", "bottom"] as const;

const meta = {
  title: "Componentes/Sheet",
  component: Sheet,
} satisfies Meta<typeof Sheet>;

export default meta;

type Story = StoryObj<typeof meta>;

function DetailSheet({ locale }: { locale: unknown }) {
  const t = storyMessages(locale);
  return (
    <Sheet defaultOpen>
      <SheetTrigger asChild>
        <Button variant="secondary">{t.actions.viewAll}</Button>
      </SheetTrigger>
      <SheetContent closeLabel={t.actions.close}>
        <SheetHeader>
          <SheetTitle>{t.overlays.detailTitle}</SheetTitle>
          <SheetDescription>{t.overlays.detailBody}</SheetDescription>
        </SheetHeader>
        <SheetBody>
          <ul className="flex flex-col">
            {t.overlays.variants.map((name, index) => (
              <li key={name}>
                {index > 0 && <Separator />}
                <div className="flex items-center justify-between gap-4 py-3 text-sm">
                  <span>{name}</span>
                  <Badge variant={index === 2 ? "warning" : "secondary"}>
                    <span className="tabular-nums">{12 - index * 5}</span>{" "}
                    {t.overlays.units}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </SheetBody>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="ghost">{t.actions.cancel}</Button>
          </SheetClose>
          <Button>{t.actions.edit}</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export const Lados: Story = {
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    return (
      <div className="flex flex-wrap gap-3">
        {SIDES.map((side) => (
          <Sheet key={side}>
            <SheetTrigger asChild>
              <Button variant="secondary">{t.overlays.sides[side]}</Button>
            </SheetTrigger>
            <SheetContent side={side} closeLabel={t.actions.close}>
              <SheetHeader>
                <SheetTitle>{t.overlays.detailTitle}</SheetTitle>
                <SheetDescription>{t.overlays.detailBody}</SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        ))}
      </div>
    );
  },
};

export const Abierto: Story = {
  render: (_args, { globals }) => <DetailSheet locale={globals.locale} />,
};

export const AbiertoOscuro: Story = {
  name: "Abierto (oscuro)",
  globals: { theme: "oscuro" },
  render: (_args, { globals }) => <DetailSheet locale={globals.locale} />,
};
