import type { Meta, StoryObj } from "@storybook/react-vite";
import { storyMessages } from "../stories/messages";

const RADII = [
  { className: "rounded-sm", px: 8 },
  { className: "rounded-md", px: 10 },
  { className: "rounded-lg", px: 12 },
] as const;

const SPACING = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24] as const;

function Radii({ locale }: { locale: unknown }) {
  const t = storyMessages(locale).radii;
  return (
    <section>
      <h2 className="font-display text-2xl font-semibold">{t.title}</h2>
      <p className="mb-6 text-sm opacity-70">{t.note}</p>
      <div className="flex flex-wrap gap-6">
        {RADII.map(({ className, px }) => (
          <div key={className} className="flex flex-col items-center gap-2">
            <div
              className={`${className} size-24 border border-border bg-card`}
            />
            <span className="font-mono text-xs opacity-70">
              {className} · {px}px
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Spacing({ locale }: { locale: unknown }) {
  const t = storyMessages(locale).spacing;
  return (
    <section>
      <h2 className="font-display text-2xl font-semibold">{t.title}</h2>
      <p className="mb-6 text-sm opacity-70">{t.note}</p>
      <div className="flex flex-col gap-2">
        {SPACING.map((step) => (
          <div key={step} className="flex items-center gap-4">
            <span className="w-28 shrink-0 font-mono text-xs opacity-70">
              {step} · {step * 4}px
            </span>
            <div
              className="h-4 rounded-sm bg-primary"
              style={{ width: `calc(var(--spacing) * ${step})` }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

const meta = {
  title: "Fundamentos/Radios y espaciados",
} satisfies Meta;

export default meta;

export const Radios: StoryObj = {
  render: (_args, { globals }) => <Radii locale={globals.locale} />,
};

export const Espaciados: StoryObj = {
  render: (_args, { globals }) => <Spacing locale={globals.locale} />,
};
