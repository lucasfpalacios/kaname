import type { Meta, StoryObj } from "@storybook/react-vite";
import { storyMessages } from "../../stories/messages";
import { forcedStates, StoryRow } from "../../stories/story-row";
import { ThemePanels } from "../../stories/theme-panels";
import { FormField } from "../form-field";
import { PasswordInput } from "./password-input";

const meta = {
  title: "Formularios/PasswordInput",
  component: PasswordInput,
  args: { showLabel: "", hideLabel: "" },
} satisfies Meta<typeof PasswordInput>;

export default meta;

type Story = StoryObj<typeof meta>;

const labels = (locale: unknown) => {
  const a = storyMessages(locale).auth;
  return { showLabel: a.showPassword, hideLabel: a.hidePassword };
};

export const Playground: Story = {
  render: (_args, { globals }) => (
    <div className="max-w-sm">
      <FormField label={storyMessages(globals.locale).auth.password}>
        <PasswordInput
          {...labels(globals.locale)}
          defaultValue="contraseña secreta"
        />
      </FormField>
    </div>
  ),
};

// Vacío, con valor, con foco, con error y deshabilitado. El ojo muestra u oculta la contraseña.
export const Estados: Story = {
  parameters: forcedStates,
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    const props = labels(globals.locale);
    return (
      <ThemePanels labels={t}>
        <div className="flex flex-col gap-3">
          <StoryRow label={t.states.empty}>
            <PasswordInput
              {...props}
              aria-label={t.auth.password}
              className="max-w-64"
            />
          </StoryRow>
          <StoryRow label={t.states.default}>
            <PasswordInput
              {...props}
              aria-label={t.auth.password}
              defaultValue="contraseña secreta"
              className="max-w-64"
            />
          </StoryRow>
          <StoryRow label={t.states.focus}>
            <PasswordInput
              {...props}
              aria-label={t.auth.password}
              defaultValue="contraseña secreta"
              className="force-focus-within max-w-64"
            />
          </StoryRow>
          <StoryRow label={t.states.error}>
            <PasswordInput
              {...props}
              aria-label={t.auth.password}
              aria-invalid
              defaultValue="corta"
              className="max-w-64"
            />
          </StoryRow>
          <StoryRow label={t.states.disabled}>
            <PasswordInput
              {...props}
              aria-label={t.auth.password}
              disabled
              defaultValue="contraseña secreta"
              className="max-w-64"
            />
          </StoryRow>
        </div>
      </ThemePanels>
    );
  },
};
