import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
} from "@kaname/ui";
import { CalendarDays } from "lucide-react";
import { getTranslations } from "next-intl/server";

// Próximos eventos de todos los espacios (inicio y General). Vacío hasta que exista el calendario
// (Fase 5): sin eventos inventados.
export async function UpcomingEvents({ className }: { className?: string }) {
  const t = await getTranslations("Pages");
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle asChild>
          <h2 className="flex items-center gap-2 text-lg">
            <CalendarDays aria-hidden="true" className="size-5 text-primary" />
            {t("upcoming")}
          </h2>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <EmptyState
          variant="plain"
          className="py-6"
          icon={<CalendarDays />}
          title={t("noData")}
          description={t("noEventsDescription")}
        />
      </CardContent>
    </Card>
  );
}
