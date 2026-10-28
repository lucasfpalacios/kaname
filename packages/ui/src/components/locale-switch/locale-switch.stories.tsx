import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { storyMessages } from "../../stories/messages";
import { ThemePanels } from "../../stories/theme-panels";
import { LocaleSwitch } from "./locale-switch";

const meta = {
  title: "Layout/LocaleSwitch",
  component: LocaleSwitch,
  args: { options: [], value: "es", onValueChange: () => undefined, label: "" },
} satisfies Meta<typeof LocaleSwitch>;

export default meta;

type Story = StoryObj<typeof meta>;

function Switch({ locale, disabled }: { locale: unknown; disabled?: boolean }) {
  const s = storyMessages(locale).shell;
  const [value, setValue] = useState("es");
  return (
    <LocaleSwitch
      label={s.language}
      value={value}
      onValueChange={setValue}
      disabled={disabled}
      options={[
        { value: "es", short: "ES", name: s.spanish },
        { value: "en", short: "EN", name: s.english },
      ]}
    />
  );
}

// Cambiá de idioma: la píldora se desliza y las letras se "decodifican" (ES → EN letra por
// letra). En la app, además, la página hace el fundido con desenfoque (fadeLocaleChange).
export const Interactivo: Story = {
  render: (_args, { globals }) => (
    <ThemePanels labels={storyMessages(globals.locale)}>
      <div className="flex gap-4">
        <Switch locale={globals.locale} />
        <Switch locale={globals.locale} disabled />
      </div>
    </ThemePanels>
  ),
};
