import type { Meta, StoryObj } from "@storybook/react-vite";
import { Columns3, LayoutGrid, List } from "lucide-react";
import { useState } from "react";
import { storyMessages } from "../../stories/messages";
import { forcedStates, StoryRow } from "../../stories/story-row";
import { ThemePanels } from "../../stories/theme-panels";
import { SegmentedControl } from "./segmented-control";

const meta = {
  title: "Formularios/SegmentedControl",
  component: SegmentedControl,
  args: {
    options: [],
    value: undefined,
    onValueChange: () => undefined,
    label: "",
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;

type Story = StoryObj<typeof meta>;

function ViewControl({
  locale,
  initial,
  disabled,
  className,
}: {
  locale: unknown;
  initial?: string;
  disabled?: boolean;
  className?: string;
}) {
  const s = storyMessages(locale).shell;
  const [value, setValue] = useState(initial);
  return (
    <SegmentedControl
      label={s.viewMode}
      tooltips
      value={value}
      onValueChange={setValue}
      disabled={disabled}
      className={className}
      options={[
        { value: "list", label: s.viewList, content: <List /> },
        { value: "grid", label: s.viewGrid, content: <LayoutGrid /> },
        { value: "board", label: s.viewBoard, content: <Columns3 /> },
      ]}
    />
  );
}

// Elegí una opción (o usá las flechas): la píldora se desliza en ~200 ms. Cada ícono tiene su
// tooltip y su aria-label.
export const Interactivo: Story = {
  render: (_args, { globals }) => (
    <ThemePanels labels={storyMessages(globals.locale)}>
      <ViewControl locale={globals.locale} initial="grid" />
    </ThemePanels>
  ),
};

// Sin ninguna marcada (antes de saber el valor), con foco y deshabilitado.
export const Estados: Story = {
  parameters: forcedStates,
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    return (
      <ThemePanels labels={t}>
        <div className="flex flex-col gap-3">
          <StoryRow label={t.states.empty}>
            <ViewControl locale={globals.locale} />
          </StoryRow>
          <StoryRow label={t.states.focus}>
            <ViewControl
              locale={globals.locale}
              initial="list"
              className="force-focus-within"
            />
          </StoryRow>
          <StoryRow label={t.states.disabled}>
            <ViewControl locale={globals.locale} initial="board" disabled />
          </StoryRow>
        </div>
      </ThemePanels>
    );
  },
};
