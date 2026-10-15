import type { Meta, StoryObj } from "@storybook/react-vite";
import { storyMessages } from "../../stories/messages";
import { storyIntlLocale } from "../../stories/story-row";
import { recentOrders } from "../../stories/tank-vault";
import { ThemePanels } from "../../stories/theme-panels";
import { MoneyText } from "../money-text";
import { OrderStatusBadge } from "../status-badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

const meta = {
  title: "Datos/Table",
  component: Table,
} satisfies Meta<typeof Table>;

export default meta;

type Story = StoryObj<typeof meta>;

// Tabla simple, sin orden ni paginación. La segunda fila está seleccionada.
export const Simple: Story = {
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    const locale = storyIntlLocale(globals.locale);
    return (
      <ThemePanels labels={t}>
        <Table>
          <TableCaption>{t.data.orders}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>{t.table.product}</TableHead>
              <TableHead className="text-right">{t.table.price}</TableHead>
              <TableHead>{t.table.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentOrders.slice(0, 4).map((order, index) => (
              <TableRow
                key={order.id}
                data-state={index === 1 ? "selected" : undefined}
              >
                <TableCell className="font-medium whitespace-nowrap">
                  {order.id}
                </TableCell>
                <TableCell>{order.product}</TableCell>
                <TableCell className="text-right">
                  <MoneyText
                    value={order.total}
                    currency="ARS"
                    locale={locale}
                    hideDecimals
                  />
                </TableCell>
                <TableCell>
                  <OrderStatusBadge
                    status={order.status}
                    label={t.data.orderStatus[order.status]}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ThemePanels>
    );
  },
};
