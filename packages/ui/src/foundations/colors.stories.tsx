import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState } from "react";
import { storyMessages } from "../stories/messages";
import { ThemePanels } from "../stories/theme-panels";

const TOKENS = [
  "background",
  "card",
  "border",
  "foreground",
  "muted-foreground",
  "primary",
  "primary-foreground",
  "accent",
  "accent-soft",
  "success",
  "success-soft",
  "warning",
  "warning-soft",
  "destructive",
  "destructive-soft",
  "chart-1",
  "chart-2",
] as const;

type Token = (typeof TOKENS)[number];

// Lee el valor real de la variable en su contenedor, así la story no repite los hex de tokens.css.
function Swatch({ token, label }: { token: Token; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (ref.current) {
      setValue(
        getComputedStyle(ref.current).getPropertyValue(`--${token}`).trim(),
      );
    }
  }, [token]);

  return (
    <div className="flex items-center gap-3">
      <div
        ref={ref}
        className="size-12 shrink-0 rounded-md border border-border"
        style={{ background: `var(--${token})` }}
      />
      <div className="min-w-0 text-sm">
        <p className="font-medium">{label}</p>
        <p className="truncate font-mono text-xs opacity-70">
          --{token} · {value}
        </p>
      </div>
    </div>
  );
}

function Palette({ locale }: { locale: unknown }) {
  const t = storyMessages(locale);
  return (
    <ThemePanels labels={t}>
      <div className="grid gap-4 sm:grid-cols-2">
        {TOKENS.map((token) => (
          <Swatch key={token} token={token} label={t.colors[token]} />
        ))}
      </div>
    </ThemePanels>
  );
}

const meta = {
  title: "Fundamentos/Colores",
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;

export const Paleta: StoryObj = {
  render: (_args, { globals }) => <Palette locale={globals.locale} />,
};
