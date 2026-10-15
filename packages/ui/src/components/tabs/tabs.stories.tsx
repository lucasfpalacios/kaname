import type { Meta, StoryObj } from "@storybook/react-vite";
import { History, Layers, Tag } from "lucide-react";
import { storyMessages } from "../../stories/messages";
import { forcedStates, StoryRow } from "../../stories/story-row";
import { ThemePanels } from "../../stories/theme-panels";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

const VARIANTS = ["pill", "line"] as const;

const meta = {
  title: "Componentes/Tabs",
  component: Tabs,
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

function ProductTabs({
  locale,
  variant,
  withStates,
}: {
  locale: unknown;
  variant: (typeof VARIANTS)[number];
  withStates?: boolean;
}) {
  const t = storyMessages(locale).tabs;
  return (
    <Tabs defaultValue="general" className="w-full max-w-lg">
      <TabsList variant={variant}>
        <TabsTrigger value="general">{t.general}</TabsTrigger>
        <TabsTrigger
          value="variants"
          className={withStates ? "force-hover" : undefined}
        >
          <Layers />
          {t.variants}
        </TabsTrigger>
        <TabsTrigger
          value="prices"
          className={withStates ? "force-focus" : undefined}
        >
          <Tag />
          {t.prices}
        </TabsTrigger>
        <TabsTrigger value="history" disabled>
          <History />
          {t.history}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="general" className="text-sm">
        {t.generalBody}
      </TabsContent>
      <TabsContent value="variants" className="text-sm">
        {t.variantsBody}
      </TabsContent>
      <TabsContent value="prices" className="text-sm">
        {t.pricesBody}
      </TabsContent>
    </Tabs>
  );
}

export const Playground: Story = {
  render: (_args, { globals }) => (
    <ProductTabs locale={globals.locale} variant="pill" />
  ),
};

// Activa, hover (Variantes), foco (Precios) y deshabilitada (Historial).
export const VariantesYEstados: Story = {
  name: "Variantes y estados",
  parameters: forcedStates,
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    return (
      <ThemePanels labels={t}>
        <div className="flex flex-col gap-8">
          {VARIANTS.map((variant) => (
            <StoryRow key={variant} label={variant}>
              <ProductTabs
                locale={globals.locale}
                variant={variant}
                withStates
              />
            </StoryRow>
          ))}
        </div>
      </ThemePanels>
    );
  },
};
