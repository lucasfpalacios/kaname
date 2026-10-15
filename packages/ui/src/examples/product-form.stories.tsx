import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type FormEvent } from "react";
import { Button } from "../components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/card";
import { Checkbox } from "../components/checkbox";
import { Combobox, type ComboboxOption } from "../components/combobox";
import { DatePicker } from "../components/date-picker";
import { FormField } from "../components/form-field";
import { Input } from "../components/input";
import { Label } from "../components/label";
import { ModuleKanji } from "../components/module-kanji";
import { MoneyInput, type MoneyCurrency } from "../components/money-input";
import { PercentInput } from "../components/percent-input";
import { RadioGroup, RadioGroupItem } from "../components/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/select";
import { Separator } from "../components/separator";
import { Switch } from "../components/switch";
import { Textarea } from "../components/textarea";
import { storyMessages } from "../stories/messages";
import { storyIntlLocale } from "../stories/story-row";

const SUPPLIERS: ComboboxOption[] = [
  { value: "s1", label: "Distribuidora Andina" },
  { value: "s2", label: "Importadora del Sur" },
  { value: "s3", label: "TCG Mayorista" },
];

// Solo para la demo: la validación real de montos la hace la API con Decimal.
const isLower = (a: string | null, b: string | null) =>
  a !== null && b !== null && Number(a) < Number(b);

function ProductForm({ locale }: { locale: unknown }) {
  const t = storyMessages(locale);
  const f = t.form;
  const intlLocale = storyIntlLocale(locale);

  const [name, setName] = useState("");
  const [supplier, setSupplier] = useState<string | null>(null);
  const [currency, setCurrency] = useState<MoneyCurrency>("ARS");
  const [cost, setCost] = useState<string | null>("12000");
  const [price, setPrice] = useState<string | null>("10000");
  const [margin, setMargin] = useState<string | null>("35");
  const [releaseDate, setReleaseDate] = useState<Date | undefined>();
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const nameError = submitted && !name.trim() ? f.nameRequired : undefined;
  const priceError = isLower(price, cost) ? f.priceError : undefined;

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (!name.trim() || priceError) return;
    setSaving(true);
    setTimeout(() => setSaving(false), 1500);
  };

  return (
    <Card className="max-w-3xl">
      <form onSubmit={onSubmit} noValidate className="contents">
        <CardHeader>
          <CardTitle asChild>
            <h1 className="flex items-baseline gap-3 text-2xl font-extrabold">
              {f.title}
              <ModuleKanji module="PRODUCTS" size="sm" />
            </h1>
          </CardTitle>
          <CardDescription>{f.descriptionHelp}</CardDescription>
        </CardHeader>

        <CardContent className="grid gap-5 sm:grid-cols-2">
          <FormField
            label={f.name}
            required
            error={nameError}
            className="sm:col-span-2"
          >
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={f.namePlaceholder}
            />
          </FormField>

          <FormField
            label={f.description}
            description={f.descriptionHelp}
            className="sm:col-span-2"
          >
            <Textarea />
          </FormField>

          <FormField label={f.category} required>
            <Select defaultValue="sealed">
              <SelectTrigger>
                <SelectValue placeholder={f.categoryPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cards">{f.categories.cards}</SelectItem>
                <SelectItem value="sealed">{f.categories.sealed}</SelectItem>
                <SelectItem value="accessories">
                  {f.categories.accessories}
                </SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField label={f.supplier}>
            <Combobox
              options={SUPPLIERS}
              value={supplier}
              onValueChange={setSupplier}
              placeholder={f.supplierPlaceholder}
              searchPlaceholder={f.supplierSearch}
              emptyText={f.supplierEmpty}
            />
          </FormField>

          <Separator className="sm:col-span-2" />

          <FormField label={f.cost} description={f.costHelp}>
            <MoneyInput
              value={cost}
              onValueChange={setCost}
              currency={currency}
              onCurrencyChange={setCurrency}
              currencyLabel={f.currency}
              locale={intlLocale}
            />
          </FormField>

          <FormField label={f.price} required error={priceError}>
            <MoneyInput
              value={price}
              onValueChange={setPrice}
              currency={currency}
              locale={intlLocale}
            />
          </FormField>

          <FormField label={f.margin} description={f.marginHelp}>
            <PercentInput
              value={margin}
              onValueChange={setMargin}
              locale={intlLocale}
            />
          </FormField>

          <FormField label={f.tax}>
            <Select defaultValue="21">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="21">21 %</SelectItem>
                <SelectItem value="10.5">10,5 %</SelectItem>
                <SelectItem value="0">0 %</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <Separator className="sm:col-span-2" />

          <FormField label={f.condition}>
            <RadioGroup
              defaultValue="new"
              className="grid-flow-col justify-start gap-4"
            >
              {(["new", "used", "damaged"] as const).map((key) => (
                <div key={key} className="flex items-center gap-2">
                  <RadioGroupItem id={`condition-${key}`} value={key} />
                  <Label htmlFor={`condition-${key}`}>
                    {f.conditions[key]}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </FormField>

          <FormField label={f.releaseDate}>
            <DatePicker
              value={releaseDate}
              onValueChange={setReleaseDate}
              placeholder={f.datePlaceholder}
              locale={intlLocale}
            />
          </FormField>

          <div className="flex items-start gap-3 sm:col-span-2">
            <Switch
              id="track-stock"
              defaultChecked
              aria-describedby="track-stock-help"
            />
            <div className="flex flex-col gap-1">
              <Label htmlFor="track-stock">{f.trackStock}</Label>
              <p id="track-stock-help" className="text-xs text-foreground/70">
                {f.trackStockHelp}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:col-span-2">
            <Checkbox id="reviewed" />
            <Label htmlFor="reviewed">{f.terms}</Label>
          </div>
        </CardContent>

        <CardFooter className="justify-end">
          <Button type="button" variant="ghost">
            {t.actions.cancel}
          </Button>
          <Button type="submit" loading={saving}>
            {t.actions.save}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

const meta = {
  title: "Ejemplos/Alta de producto",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;

export const Formulario: StoryObj = {
  render: (_args, { globals }) => <ProductForm locale={globals.locale} />,
};
