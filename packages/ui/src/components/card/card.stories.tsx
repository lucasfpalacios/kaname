import type { Meta, StoryObj } from "@storybook/react-vite";
import { Ellipsis, Plus } from "lucide-react";
import { storyMessages } from "../../stories/messages";
import { ThemePanels } from "../../stories/theme-panels";
import { Badge } from "../badge";
import { Button } from "../button";
import { IconButton } from "../icon-button";
import { Skeleton } from "../skeleton";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

const meta = {
  title: "Componentes/Card",
  component: Card,
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Completa: Story = {
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    return (
      <ThemePanels labels={t}>
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle asChild>
              <h2>{t.card.title}</h2>
            </CardTitle>
            <CardDescription>{t.card.description}</CardDescription>
            <CardAction>
              <IconButton label={t.actions.more} size="sm">
                <Ellipsis />
              </IconButton>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <p className="text-2xl font-bold whitespace-nowrap tabular-nums">
              $ 1.234.567,89
            </p>
            <p className="text-sm">{t.card.body}</p>
          </CardContent>
          <CardFooter>
            <Badge variant="success">{t.badges.paid}</Badge>
            <Button variant="ghost" size="sm" className="ml-auto">
              {t.actions.viewAll}
            </Button>
          </CardFooter>
        </Card>
      </ThemePanels>
    );
  },
};

export const SoloContenido: Story = {
  name: "Solo contenido",
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    return (
      <ThemePanels labels={t}>
        <Card className="max-w-sm">
          <CardContent>
            <p className="text-sm">{t.card.body}</p>
          </CardContent>
        </Card>
      </ThemePanels>
    );
  },
};

export const Cargando: Story = {
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    return (
      <ThemePanels labels={t}>
        <Card className="max-w-sm" aria-busy="true">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      </ThemePanels>
    );
  },
};

export const Vacia: Story = {
  name: "Vacía",
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    return (
      <ThemePanels labels={t}>
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle asChild>
              <h2>{t.card.title}</h2>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
            <p className="font-medium">{t.card.emptyTitle}</p>
            <p className="text-sm text-foreground/70">{t.card.emptyBody}</p>
            <Button size="sm">
              <Plus />
              {t.actions.newProduct}
            </Button>
          </CardContent>
        </Card>
      </ThemePanels>
    );
  },
};
