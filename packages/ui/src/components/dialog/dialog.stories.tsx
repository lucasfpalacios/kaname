import type { Meta, StoryObj } from "@storybook/react-vite";
import { Trash2 } from "lucide-react";
import { storyMessages } from "../../stories/messages";
import { Button } from "../button";
import { FormField } from "../form-field";
import { Input } from "../input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

const meta = {
  title: "Componentes/Dialog",
  component: Dialog,
} satisfies Meta<typeof Dialog>;

export default meta;

type Story = StoryObj<typeof meta>;

function EditDialog({ locale }: { locale: unknown }) {
  const t = storyMessages(locale);
  return (
    <Dialog defaultOpen>
      <DialogTrigger asChild>
        <Button variant="secondary">{t.actions.edit}</Button>
      </DialogTrigger>
      <DialogContent closeLabel={t.actions.close}>
        <DialogHeader>
          <DialogTitle>{t.overlays.editTitle}</DialogTitle>
          <DialogDescription>{t.overlays.editBody}</DialogDescription>
        </DialogHeader>
        <FormField label={t.form.name}>
          <Input defaultValue={t.overlays.detailTitle} />
        </FormField>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">{t.actions.cancel}</Button>
          </DialogClose>
          <Button>{t.actions.save}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const Confirmacion: Story = {
  name: "Confirmación",
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="destructive">
            <Trash2 />
            {t.actions.delete}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.overlays.deleteTitle}</DialogTitle>
            <DialogDescription>{t.overlays.deleteBody}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">{t.actions.cancel}</Button>
            </DialogClose>
            <Button variant="destructive">{t.actions.delete}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
};

export const Abierto: Story = {
  render: (_args, { globals }) => <EditDialog locale={globals.locale} />,
};

export const AbiertoOscuro: Story = {
  name: "Abierto (oscuro)",
  globals: { theme: "oscuro" },
  render: (_args, { globals }) => <EditDialog locale={globals.locale} />,
};
