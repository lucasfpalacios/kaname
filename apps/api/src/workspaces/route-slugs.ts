import type { Membership } from "./membership.js";

const RANK = { OWNER: 0, MEMBER: 1 } as const;

/**
 * Dirección de cada espacio en la web (/w/<routeSlug>). El slug es único por cuenta, así que dos
 * espacios que veo pueden compartirlo si son de cuentas distintas. El orden es fijo: primero los
 * de las cuentas donde soy Dueño, después los demás, y entre iguales por id. El primero se queda
 * con el slug; los siguientes usan "slug--" + los últimos 6 caracteres del id. Un slug válido nunca
 * tiene "--", así que esta forma no choca con ningún slug real.
 */
export function routeSlugs(memberships: Membership[]): Map<string, string> {
  const ordered = [...memberships].sort(
    (a, b) =>
      (a.accountRole ? RANK[a.accountRole] : 2) -
        (b.accountRole ? RANK[b.accountRole] : 2) ||
      a.workspace.id.localeCompare(b.workspace.id),
  );
  const taken = new Set<string>();
  const result = new Map<string, string>();
  for (const { workspace } of ordered) {
    const routeSlug = taken.has(workspace.slug)
      ? `${workspace.slug}--${workspace.id.slice(-6)}`
      : workspace.slug;
    taken.add(workspace.slug);
    result.set(workspace.id, routeSlug);
  }
  return result;
}
