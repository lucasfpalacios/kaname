import type { Meta, StoryObj } from "@storybook/react-vite";
import { storyMessages } from "../../stories/messages";
import { storyIntlLocale, StoryRow } from "../../stories/story-row";
import { recentOrders, TIME_ZONE } from "../../stories/tank-vault";
import { ThemePanels } from "../../stories/theme-panels";
import { DateText } from "../date-text";
import { MoneyText } from "../money-text";
import {
  OrderStatusBadge,
  orderStatusTone,
  PaymentStatusBadge,
  paymentStatusTone,
  StatusBadge,
  type OrderStatusKey,
  type PaymentStatusKey,
  type StatusTone,
} from "./status-badge";

const TONES: StatusTone[] = [
  "neutral",
  "info",
  "accent",
  "success",
  "warning",
  "danger",
];

const meta = {
  title: "Datos/StatusBadge",
  component: StatusBadge,
  args: { tone: "success", label: "Cobrado" },
  argTypes: { tone: { control: "inline-radio", options: TONES } },
} satisfies Meta<typeof StatusBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Estados: Story = {
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    const d = t.data;
    return (
      <ThemePanels labels={t}>
        <div className="flex flex-col gap-4">
          <StoryRow label={d.orders}>
            {(Object.keys(orderStatusTone) as OrderStatusKey[]).map(
              (status) => (
                <OrderStatusBadge
                  key={status}
                  status={status}
                  label={d.orderStatus[status]}
                />
              ),
            )}
          </StoryRow>
          <StoryRow label={d.payments}>
            {(Object.keys(paymentStatusTone) as PaymentStatusKey[]).map(
              (status) => (
                <PaymentStatusBadge
                  key={status}
                  status={status}
                  label={d.paymentStatus[status]}
                />
              ),
            )}
          </StoryRow>
          <StoryRow label={d.tones}>
            {TONES.map((tone) => (
              <StatusBadge key={tone} tone={tone} label={tone} />
            ))}
          </StoryRow>
        </div>
      </ThemePanels>
    );
  },
};

// Últimos pedidos de Tank Vault, combinando MoneyText, DateText y los badges.
export const UltimosPedidos: Story = {
  name: "Últimos pedidos",
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    const locale = storyIntlLocale(globals.locale);
    return (
      <ThemePanels labels={t}>
        <ul className="flex flex-col divide-y divide-border text-sm">
          {recentOrders.map((order) => (
            <li
              key={order.id}
              className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 py-3"
            >
              <div className="min-w-0">
                <p className="font-medium">
                  {order.id} · {order.customer}
                </p>
                <p className="truncate text-foreground/70">
                  {order.product} ·{" "}
                  <DateText
                    value={order.createdAt}
                    format="datetime"
                    locale={locale}
                    timeZone={TIME_ZONE}
                  />
                </p>
              </div>
              <MoneyText
                value={order.total}
                currency="ARS"
                locale={locale}
                hideDecimals
                className="text-right font-medium"
              />
              <div className="col-span-2 flex flex-wrap gap-2">
                <OrderStatusBadge
                  status={order.status}
                  label={t.data.orderStatus[order.status]}
                />
                <PaymentStatusBadge
                  status={order.payment}
                  label={t.data.paymentStatus[order.payment]}
                />
              </div>
            </li>
          ))}
        </ul>
      </ThemePanels>
    );
  },
};
