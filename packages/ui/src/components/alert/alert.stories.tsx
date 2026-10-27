import type { Meta, StoryObj } from "@storybook/react-vite";
import { storyMessages } from "../../stories/messages";
import { ThemePanels } from "../../stories/theme-panels";
import { Alert } from "./alert";

const VARIANTS = ["info", "success", "warning", "destructive"] as const;

const meta = {
  title: "Componentes/Alert",
  component: Alert,
  args: { variant: "destructive" },
  argTypes: { variant: { control: "inline-radio", options: VARIANTS } },
} satisfies Meta<typeof Alert>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args, { globals }) => (
    <Alert {...args}>
      {storyMessages(globals.locale).auth.invalidCredentials}
    </Alert>
  ),
};

export const Variantes: Story = {
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    const text = {
      info: t.auth.sessionExpired,
      success: t.auth.saved,
      warning: t.auth.tooManyAttempts,
      destructive: t.auth.invalidCredentials,
    };
    return (
      <ThemePanels labels={t}>
        <div className="flex max-w-md flex-col gap-3">
          {VARIANTS.map((variant) => (
            <Alert key={variant} variant={variant}>
              {text[variant]}
            </Alert>
          ))}
          <Alert variant="destructive" title={t.auth.signIn}>
            {t.auth.invalidCredentials}
          </Alert>
        </div>
      </ThemePanels>
    );
  },
};
