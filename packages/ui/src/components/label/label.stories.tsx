import type { Meta, StoryObj } from "@storybook/react-vite";
import { storyMessages } from "../../stories/messages";
import { ThemePanels } from "../../stories/theme-panels";
import { Input } from "../input";
import { Label } from "./label";

const meta = {
  title: "Formularios/Label",
  component: Label,
} satisfies Meta<typeof Label>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ConCampo: Story = {
  name: "Con campo",
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    return (
      <ThemePanels labels={t}>
        <div className="flex max-w-64 flex-col gap-2">
          <Label htmlFor={`label-${t.light}`}>{t.form.name}</Label>
          <Input id={`label-${t.light}`} placeholder={t.form.namePlaceholder} />
        </div>
      </ThemePanels>
    );
  },
};
