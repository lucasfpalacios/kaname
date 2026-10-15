import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { storyMessages } from "../../stories/messages";
import {
  forcedStates,
  StoryRow,
  storyIntlLocale,
} from "../../stories/story-row";
import { ThemePanels } from "../../stories/theme-panels";
import { MoneyInput, type MoneyCurrency } from "./money-input";

const meta = {
  title: "Formularios/MoneyInput",
  component: MoneyInput,
} satisfies Meta<typeof MoneyInput>;

export default meta;

// Los props los arma cada render (con estado), no los controles de Storybook.
type Story = StoryObj;

function Price({
  locale,
  initial = null,
  initialCurrency = "ARS",
  selectable = false,
  className,
  ...props
}: {
  locale: unknown;
  initial?: string | null;
  initialCurrency?: MoneyCurrency;
  selectable?: boolean;
  className?: string;
  disabled?: boolean;
  "aria-invalid"?: boolean;
}) {
  const f = storyMessages(locale).form;
  const [value, setValue] = useState<string | null>(initial);
  const [currency, setCurrency] = useState<MoneyCurrency>(initialCurrency);
  return (
    <MoneyInput
      aria-label={f.price}
      value={value}
      onValueChange={setValue}
      currency={currency}
      onCurrencyChange={selectable ? setCurrency : undefined}
      currencyLabel={f.currency}
      locale={storyIntlLocale(locale)}
      className={`max-w-56 ${className ?? ""}`}
      {...props}
    />
  );
}

// Muestra el valor canónico que recibe el formulario (lo que se manda a la API).
function PriceWithValue({ locale }: { locale: unknown }) {
  const f = storyMessages(locale).form;
  const [value, setValue] = useState<string | null>("1234.5");
  const [currency, setCurrency] = useState<MoneyCurrency>("ARS");
  return (
    <div className="flex max-w-56 flex-col gap-2">
      <MoneyInput
        aria-label={f.price}
        value={value}
        onValueChange={setValue}
        currency={currency}
        onCurrencyChange={setCurrency}
        currencyLabel={f.currency}
        locale={storyIntlLocale(locale)}
      />
      <code className="text-xs opacity-70">
        {f.value}: {JSON.stringify({ amount: value, currency })}
      </code>
    </div>
  );
}

export const Playground: Story = {
  render: (_args, { globals }) => <PriceWithValue locale={globals.locale} />,
};

export const Estados: Story = {
  parameters: forcedStates,
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    const locale = globals.locale;
    return (
      <ThemePanels labels={t}>
        <div className="flex flex-col gap-3">
          <StoryRow label={t.states.empty}>
            <Price locale={locale} />
          </StoryRow>
          <StoryRow label="ARS">
            <Price locale={locale} initial="1234567.89" />
          </StoryRow>
          <StoryRow label="USD">
            <Price locale={locale} initial="49.9" initialCurrency="USD" />
          </StoryRow>
          <StoryRow label={t.form.currency}>
            <Price locale={locale} initial="15000" selectable />
          </StoryRow>
          <StoryRow label={t.states.focus}>
            <Price
              locale={locale}
              initial="15000"
              className="force-focus-within"
            />
          </StoryRow>
          <StoryRow label={t.states.disabled}>
            <Price locale={locale} initial="15000" disabled />
          </StoryRow>
          <StoryRow label={t.states.error}>
            <Price locale={locale} initial="100" aria-invalid />
          </StoryRow>
        </div>
      </ThemePanels>
    );
  },
};
