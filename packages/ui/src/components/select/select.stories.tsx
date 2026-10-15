import type { Meta, StoryObj } from "@storybook/react-vite";
import { storyMessages } from "../../stories/messages";
import { forcedStates, StoryRow } from "../../stories/story-row";
import { ThemePanels } from "../../stories/theme-panels";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select";

const meta = {
  title: "Formularios/Select",
  component: Select,
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

function CategorySelect({
  locale,
  defaultValue,
  disabled,
  invalid,
  className,
}: {
  locale: unknown;
  defaultValue?: string;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
}) {
  const f = storyMessages(locale).form;
  return (
    <Select defaultValue={defaultValue} disabled={disabled}>
      <SelectTrigger
        aria-label={f.category}
        aria-invalid={invalid}
        className={`max-w-64 ${className ?? ""}`}
      >
        <SelectValue placeholder={f.categoryPlaceholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{f.category}</SelectLabel>
          <SelectItem value="cards">{f.categories.cards}</SelectItem>
          <SelectItem value="sealed">{f.categories.sealed}</SelectItem>
          <SelectSeparator />
          <SelectItem value="accessories">
            {f.categories.accessories}
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export const Playground: Story = {
  render: (_args, { globals }) => <CategorySelect locale={globals.locale} />,
};

export const Estados: Story = {
  parameters: forcedStates,
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    const locale = globals.locale;
    return (
      <ThemePanels labels={t}>
        <div className="flex flex-col gap-3">
          <StoryRow label={t.states.empty}>
            <CategorySelect locale={locale} />
          </StoryRow>
          <StoryRow label={t.states.default}>
            <CategorySelect locale={locale} defaultValue="cards" />
          </StoryRow>
          <StoryRow label={t.states.focus}>
            <CategorySelect
              locale={locale}
              defaultValue="cards"
              className="force-focus"
            />
          </StoryRow>
          <StoryRow label={t.states.disabled}>
            <CategorySelect locale={locale} defaultValue="cards" disabled />
          </StoryRow>
          <StoryRow label={t.states.error}>
            <CategorySelect locale={locale} invalid />
          </StoryRow>
        </div>
      </ThemePanels>
    );
  },
};
