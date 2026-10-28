import { EmptyState } from "@kaname/ui";
import type { ModuleKey } from "@kaname/shared";
import { getTranslations } from "next-intl/server";
import { MODULE_PHASE } from "@/lib/workspaces/modules";
import { MODULE_ICON } from "../../module-icons";

// Lugar de un módulo que todavía no está construido: qué va a hacer y en qué fase del ROADMAP se
// construye. Cada módulo reemplaza esto en su fase.
export async function ModulePlaceholder({ module }: { module: ModuleKey }) {
  const [tInfo, tPages, tPhases] = await Promise.all([
    getTranslations("ModuleInfo"),
    getTranslations("Pages"),
    getTranslations("Phases"),
  ]);
  const phase = MODULE_PHASE[module];
  return (
    <EmptyState
      icon={MODULE_ICON[module]}
      title={tInfo(module)}
      description={tPages("plannedIn", {
        phase,
        name: tPhases(String(phase) as `${typeof phase}`),
      })}
    />
  );
}
