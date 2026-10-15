import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { storyMessages } from "../../stories/messages";
import { StoryRow } from "../../stories/story-row";
import { ThemePanels } from "../../stories/theme-panels";
import { Combobox, type ComboboxOption } from "./combobox";

const SUPPLIERS: ComboboxOption[] = [
  { value: "s1", label: "Distribuidora Andina", keywords: ["DAN"] },
  { value: "s2", label: "Importadora del Sur", keywords: ["IDS"] },
  { value: "s3", label: "TCG Mayorista", keywords: ["TCG"] },
  { value: "s4", label: "Papelera Norte" },
  { value: "s5", label: "Proveedor inactivo", disabled: true },
];

const meta = {
  title: "Formularios/Combobox",
  component: Combobox,
} satisfies Meta<typeof Combobox>;

export default meta;

// Los props los arma cada render (con estado), no los controles de Storybook.
type Story = StoryObj;

function SupplierCombobox({
  locale,
  initial = null,
  disabled,
  invalid,
}: {
  locale: unknown;
  initial?: string | null;
  disabled?: boolean;
  invalid?: boolean;
}) {
  const f = storyMessages(locale).form;
  const [value, setValue] = useState<string | null>(initial);
  return (
    <Combobox
      aria-label={f.supplier}
      options={SUPPLIERS}
      value={value}
      onValueChange={setValue}
      placeholder={f.supplierPlaceholder}
      searchPlaceholder={f.supplierSearch}
      emptyText={f.supplierEmpty}
      disabled={disabled}
      aria-invalid={invalid}
      className="max-w-64"
    />
  );
}

export const Playground: Story = {
  render: (_args, { globals }) => <SupplierCombobox locale={globals.locale} />,
};

export const Estados: Story = {
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    const locale = globals.locale;
    return (
      <ThemePanels labels={t}>
        <div className="flex flex-col gap-3">
          <StoryRow label={t.states.empty}>
            <SupplierCombobox locale={locale} />
          </StoryRow>
          <StoryRow label={t.states.default}>
            <SupplierCombobox locale={locale} initial="s3" />
          </StoryRow>
          <StoryRow label={t.states.disabled}>
            <SupplierCombobox locale={locale} initial="s3" disabled />
          </StoryRow>
          <StoryRow label={t.states.error}>
            <SupplierCombobox locale={locale} invalid />
          </StoryRow>
        </div>
      </ThemePanels>
    );
  },
};
