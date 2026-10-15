import type { Meta, StoryObj } from "@storybook/react-vite";
import { CalendarDays, LayoutGrid, Plus } from "lucide-react";
import { AppShell } from "../components/app-shell";
import { Badge } from "../components/badge";
import { Button } from "../components/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/card";
import { DateText } from "../components/date-text";
import { PageHeader } from "../components/page-header";
import { WorkspaceAccent } from "../components/workspace-accent";
import { WorkspaceTile } from "../components/workspace-tile";
import { fill, StorySidebar, StoryTopBar } from "../stories/app-frame";
import { storyMessages } from "../stories/messages";
import { storyIntlLocale } from "../stories/story-row";
import { TIME_ZONE } from "../stories/tank-vault";
import { upcomingEvents, workspaces } from "../stories/workspaces";

// Pantalla de inicio (launcher) como home_light/dark de Stitch: un botón grande por espacio,
// "General" para el panel consolidado y la tile para crear uno nuevo.
function Inicio({ locale: storyLocale }: { locale: unknown }) {
  const t = storyMessages(storyLocale);
  const s = t.shell;
  const locale = storyIntlLocale(storyLocale);
  const today = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TIME_ZONE,
  }).format(new Date("2026-10-15T12:00:00Z"));

  return (
    <AppShell
      skipToContentLabel={s.skip}
      sidebar={
        <StorySidebar
          locale={storyLocale}
          workspaceId="general"
          active="GENERAL"
        />
      }
      topBar={<StoryTopBar locale={storyLocale} />}
    >
      <PageHeader
        title={s.greeting}
        description={
          <span className="inline-block first-letter:uppercase">{today}</span>
        }
        actions={
          <Button>
            <Plus />
            {s.newWorkspace}
          </Button>
        }
      />
      <section
        aria-label={s.workspaces}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        <WorkspaceTile
          asChild
          selected
          name={s.general}
          description={s.generalDescription}
          icon={<LayoutGrid />}
          badge={s.global}
        >
          <a href="#" />
        </WorkspaceTile>
        {workspaces.map((workspace) => (
          <WorkspaceTile
            key={workspace.id}
            asChild
            name={workspace.name}
            description={s.types[workspace.type]}
            initials={workspace.initials}
            color={workspace.color}
            badge={fill(s.pending, { count: workspace.pending })}
          >
            <a href="#" />
          </WorkspaceTile>
        ))}
        <WorkspaceTile
          variant="create"
          name={s.createWorkspace}
          description={s.createWorkspaceDescription}
        />
      </section>
      <Card>
        <CardHeader>
          <CardTitle asChild>
            <h2 className="flex items-center gap-2 text-lg">
              <CalendarDays
                aria-hidden="true"
                className="size-5 text-primary"
              />
              {s.upcoming}
            </h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {upcomingEvents.map((event, index) => {
              const workspace = workspaces.find(
                (w) => w.id === event.workspaceId,
              )!;
              return (
                <WorkspaceAccent key={event.at} asChild color={workspace.color}>
                  <li className="flex flex-col gap-2 rounded-md border border-border p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <DateText
                        value={event.at}
                        format="weekdayTime"
                        locale={locale}
                        timeZone={TIME_ZONE}
                        className="font-medium text-primary"
                      />
                      <Badge variant="accent">{workspace.name}</Badge>
                    </div>
                    <p className="text-sm">{s.events[index]}</p>
                  </li>
                </WorkspaceAccent>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </AppShell>
  );
}

const meta = {
  title: "Pantallas/Inicio",
  component: Inicio,
  parameters: { layout: "fullscreen" },
  args: { locale: "es" },
} satisfies Meta<typeof Inicio>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Claro: Story = {
  render: (_args, { globals }) => <Inicio locale={globals.locale} />,
};

export const Oscuro: Story = {
  globals: { theme: "oscuro" },
  render: (_args, { globals }) => <Inicio locale={globals.locale} />,
};
