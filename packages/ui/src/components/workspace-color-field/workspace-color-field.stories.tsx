import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { storyMessages } from "../../stories/messages";
import { ThemePanels } from "../../stories/theme-panels";
import { WorkspaceColorField } from "./workspace-color-field";

const meta = {
  title: "Formularios/WorkspaceColorField",
  component: WorkspaceColorField,
  args: {
    value: null,
    onChange: () => undefined,
    labels: {
      legend: "",
      none: "",
      custom: "",
      preview: "",
      invalid: "",
      announce: () => "",
    },
    preview: { name: "", initials: "", badge: "" },
  },
} satisfies Meta<typeof WorkspaceColorField>;

export default meta;

type Story = StoryObj<typeof meta>;

function Field({
  locale,
  initial,
  error,
  disabled,
}: {
  locale: unknown;
  initial: string | null;
  error?: boolean;
  disabled?: boolean;
}) {
  const t = storyMessages(locale);
  const s = t.shell;
  const [color, setColor] = useState(initial);
  return (
    <WorkspaceColorField
      value={color}
      onChange={setColor}
      disabled={disabled}
      error={error ? s.colorInvalid : undefined}
      labels={{
        legend: s.colorLegend,
        none: s.colorNone,
        custom: s.colorCustom,
        preview: s.colorPreview,
        invalid: s.colorInvalid,
        announce: (value) => `${s.colorLegend}: ${value ?? s.colorNone}`,
      }}
      preview={{ name: "Disanza", initials: "DZ", badge: s.owner }}
    />
  );
}

// Elegí una sugerencia o escribí un #rrggbb: la vista previa cambia al instante, en claro y oscuro.
export const Interactivo: Story = {
  render: (_args, { globals }) => (
    <ThemePanels labels={storyMessages(globals.locale)}>
      <Field locale={globals.locale} initial="#e07a3f" />
    </ThemePanels>
  ),
};

// Sin color (acento por defecto del tema), con un color propio fuera de las sugerencias, con
// error y deshabilitado.
export const Estados: Story = {
  render: (_args, { globals }) => (
    <ThemePanels labels={storyMessages(globals.locale)}>
      <div className="flex flex-col gap-8">
        <Field locale={globals.locale} initial={null} />
        <Field locale={globals.locale} initial="#7a5c99" />
        <Field locale={globals.locale} initial="#2a9d8f" error />
        <Field locale={globals.locale} initial="#3d6bd1" disabled />
      </div>
    </ThemePanels>
  ),
};
