import type { Meta, StoryObj } from "@storybook/react-vite";
import { storyMessages } from "../../stories/messages";
import { ThemePanels } from "../../stories/theme-panels";
import { Button } from "../button";
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  Toaster,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  toast,
  type ToastVariant,
} from "./toast";

const VARIANTS = ["default", "success", "warning", "destructive"] as const;

const meta = {
  title: "Componentes/Toast",
  component: Toast,
} satisfies Meta<typeof Toast>;

export default meta;

type Story = StoryObj<typeof meta>;

const bodyKey = (variant: ToastVariant) => `${variant}Body` as const;

// Declarativo y sin vencimiento, con el viewport en el flujo para verlo en los dos temas.
export const Variantes: Story = {
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    return (
      <ThemePanels labels={t}>
        <ToastProvider label={t.toast.label} duration={Infinity}>
          {VARIANTS.map((variant) => (
            <Toast key={variant} variant={variant}>
              <ToastTitle>{t.toast[variant]}</ToastTitle>
              <ToastDescription>{t.toast[bodyKey(variant)]}</ToastDescription>
              {variant === "default" && (
                <ToastAction altText={t.toast.undo}>{t.toast.undo}</ToastAction>
              )}
              <ToastClose label={t.actions.close} />
            </Toast>
          ))}
          <ToastViewport
            label={t.toast.viewportLabel}
            className="static flex-col p-0 sm:max-w-none"
          />
        </ToastProvider>
      </ThemePanels>
    );
  },
};

export const Imperativo: Story = {
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    return (
      <div className="flex flex-wrap gap-3">
        {VARIANTS.map((variant) => (
          <Button
            key={variant}
            variant="secondary"
            onClick={() =>
              toast({
                variant,
                title: t.toast[variant],
                description: t.toast[bodyKey(variant)],
              })
            }
          >
            {t.toast.show}: {variant}
          </Button>
        ))}
        <Button
          variant="secondary"
          onClick={() =>
            toast({
              title: t.toast.archived,
              action: { label: t.toast.undo, onClick: () => undefined },
            })
          }
        >
          {t.toast.show}: {t.toast.undo}
        </Button>
        <Toaster
          label={t.toast.label}
          viewportLabel={t.toast.viewportLabel}
          closeLabel={t.actions.close}
        />
      </div>
    );
  },
};
