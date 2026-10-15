import type { Meta, StoryObj } from "@storybook/react-vite";
import { Plus, SearchX, ShoppingBag } from "lucide-react";
import { storyMessages } from "../../stories/messages";
import { ThemePanels } from "../../stories/theme-panels";
import { Button } from "../button";
import { Card } from "../card";
import { EmptyState } from "./empty-state";

const meta = {
  title: "Datos/EmptyState",
  component: EmptyState,
  args: { title: "", variant: "dashed" },
  argTypes: {
    variant: { control: "inline-radio", options: ["dashed", "plain"] },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args, { globals }) => {
    const e = storyMessages(globals.locale).data.empty;
    return (
      <EmptyState
        {...args}
        icon={<ShoppingBag />}
        title={e.noOrders}
        description={e.noOrdersBody}
        action={
          <Button>
            <Plus />
            {e.newOrder}
          </Button>
        }
      />
    );
  },
};

export const Variantes: Story = {
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    const e = t.data.empty;
    return (
      <ThemePanels labels={t}>
        <div className="flex flex-col gap-4">
          <EmptyState
            icon={<ShoppingBag />}
            title={e.noOrders}
            description={e.noOrdersBody}
            action={
              <Button>
                <Plus />
                {e.newOrder}
              </Button>
            }
          />
          <Card className="py-0">
            <EmptyState
              variant="plain"
              icon={<SearchX />}
              title={e.noResults}
              description={e.noResultsBody}
              action={<Button variant="secondary">{e.clearFilters}</Button>}
            />
          </Card>
          <EmptyState title={e.noResults} />
        </div>
      </ThemePanels>
    );
  },
};
