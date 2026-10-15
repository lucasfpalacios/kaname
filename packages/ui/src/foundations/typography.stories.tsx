import type { Meta, StoryObj } from "@storybook/react-vite";
import { storyMessages } from "../stories/messages";

// Escala de tokens.md: 12 / 14 / 16 / 18 / 22 / 28 / 36.
const SCALE = [
  { className: "text-xs", px: 12 },
  { className: "text-sm", px: 14 },
  { className: "text-base", px: 16 },
  { className: "text-lg", px: 18 },
  { className: "text-xl", px: 22 },
  { className: "text-2xl", px: 28 },
  { className: "text-3xl", px: 36 },
] as const;

// Display: 800 para h1; 600 para h2, h3, nombres de espacio y acentos kanji.
const DISPLAY_WEIGHTS = [
  { className: "font-extrabold", weight: 800 },
  { className: "font-semibold", weight: 600 },
] as const;

const SANS_WEIGHTS = [
  { className: "font-normal", weight: 400 },
  { className: "font-medium", weight: 500 },
  { className: "font-bold", weight: 700 },
] as const;

function Row({ meta, children }: { meta: string; children: string }) {
  return (
    <div className="flex items-baseline gap-6 border-b border-border py-3">
      <span className="w-40 shrink-0 font-mono text-xs opacity-70">{meta}</span>
      <span className="min-w-0">{children}</span>
    </div>
  );
}

function Typography({ locale }: { locale: unknown }) {
  const t = storyMessages(locale).typography;
  return (
    <div className="flex max-w-4xl flex-col gap-10">
      <section>
        <h2 className="font-display text-2xl font-semibold">{t.display}</h2>
        <p className="mb-4 text-sm opacity-70">{t.displayNote}</p>
        {SCALE.filter(({ px }) => px >= 18).map(({ className, px }) =>
          DISPLAY_WEIGHTS.map((w) => (
            <div
              key={`${className}-${w.weight}`}
              className={`font-display ${className} ${w.className}`}
            >
              <Row meta={`${className} · ${px}px · ${w.weight}`}>
                {t.sample}
              </Row>
            </div>
          )),
        )}
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold">{t.sans}</h2>
        <p className="mb-4 text-sm opacity-70">{t.sansNote}</p>
        {SCALE.map(({ className, px }) =>
          SANS_WEIGHTS.map((w) => (
            <div
              key={`${className}-${w.weight}`}
              className={`font-sans ${className} ${w.className}`}
            >
              <Row meta={`${className} · ${px}px · ${w.weight}`}>
                {t.sample}
              </Row>
            </div>
          )),
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <p className="text-xs font-medium tracking-label uppercase">
            {t.label}
          </p>
          <p className="text-sm opacity-70">{t.labelNote}</p>
        </div>
        <div>
          <p className="text-xs font-medium tracking-label uppercase">
            {t.numbers}
          </p>
          <p className="text-lg whitespace-nowrap tabular-nums">
            $ 1.234.567,89
            <br />$ 98.765,40
            <br />$ 111.111,11
          </p>
        </div>
      </section>
    </div>
  );
}

const meta = {
  title: "Fundamentos/Tipografía",
} satisfies Meta;

export default meta;

export const Escala: StoryObj = {
  render: (_args, { globals }) => <Typography locale={globals.locale} />,
};
