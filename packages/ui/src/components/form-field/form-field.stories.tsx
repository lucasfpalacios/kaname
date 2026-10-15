import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { storyMessages } from "../../stories/messages";
import { storyIntlLocale } from "../../stories/story-row";
import { ThemePanels } from "../../stories/theme-panels";
import { Input } from "../input";
import { MoneyInput } from "../money-input";
import { RadioGroup, RadioGroupItem } from "../radio-group";
import { Label } from "../label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";
import { FormField } from "./form-field";

const meta = {
  title: "Formularios/FormField",
  component: FormField,
} satisfies Meta<typeof FormField>;

export default meta;

type Story = StoryObj<typeof meta>;

function Fields({ locale, prefix }: { locale: unknown; prefix: string }) {
  const f = storyMessages(locale).form;
  const [price, setPrice] = useState<string | null>("900");
  return (
    <div className="flex max-w-sm flex-col gap-5">
      <FormField label={f.name} required>
        <Input placeholder={f.namePlaceholder} />
      </FormField>
      <FormField label={f.name} required error={f.nameRequired}>
        <Input placeholder={f.namePlaceholder} />
      </FormField>
      <FormField label={f.category} description={f.marginHelp}>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder={f.categoryPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cards">{f.categories.cards}</SelectItem>
            <SelectItem value="sealed">{f.categories.sealed}</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
      <FormField label={f.price} description={f.costHelp} error={f.priceError}>
        <MoneyInput
          value={price}
          onValueChange={setPrice}
          currency="ARS"
          locale={storyIntlLocale(locale)}
        />
      </FormField>
      <FormField label={f.condition}>
        <RadioGroup
          defaultValue="new"
          className="grid-flow-col justify-start gap-4"
        >
          {(["new", "used"] as const).map((key) => (
            <div key={key} className="flex items-center gap-2">
              <RadioGroupItem id={`${prefix}-${key}`} value={key} />
              <Label htmlFor={`${prefix}-${key}`}>{f.conditions[key]}</Label>
            </div>
          ))}
        </RadioGroup>
      </FormField>
    </div>
  );
}

export const Variantes: Story = {
  args: { label: "", children: null },
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    return (
      <ThemePanels labels={t}>
        <Fields locale={globals.locale} prefix="field" />
      </ThemePanels>
    );
  },
};
