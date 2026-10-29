import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { storyMessages } from "../../stories/messages";
import { ThemePanels } from "../../stories/theme-panels";
import { FormField } from "../form-field";
import { TagInput } from "./tag-input";

const meta = {
  title: "Formularios/TagInput",
  component: TagInput,
  args: { value: [], onChange: () => undefined, removeLabel: () => "" },
} satisfies Meta<typeof TagInput>;

export default meta;

type Story = StoryObj<typeof meta>;

function Field({
  locale,
  initial,
  error,
  disabled,
}: {
  locale: unknown;
  initial: string[];
  error?: boolean;
  disabled?: boolean;
}) {
  const s = storyMessages(locale).shell;
  const [value, setValue] = useState(initial);
  return (
    <FormField
      label={s.tagLabel}
      description={s.tagHelp}
      error={error ? s.tagError : undefined}
    >
      <TagInput
        value={value}
        onChange={setValue}
        removeLabel={(tag) => `${s.tagRemove} ${tag}`}
        placeholder={s.tagPlaceholder}
        disabled={disabled}
        max={6}
      />
    </FormField>
  );
}

// Escribí un valor y Enter (o coma) para sumarlo; Backspace con el campo vacío saca el último.
// No acepta repetidos ni más de 6 valores.
export const Interactivo: Story = {
  render: (_args, { globals }) => (
    <ThemePanels labels={storyMessages(globals.locale)}>
      <div className="flex flex-col gap-6">
        <Field locale={globals.locale} initial={["EN", "ES"]} />
        <Field locale={globals.locale} initial={[]} />
        <Field locale={globals.locale} initial={["NM"]} error />
        <Field locale={globals.locale} initial={["NM", "LP"]} disabled />
      </div>
    </ThemePanels>
  ),
};
