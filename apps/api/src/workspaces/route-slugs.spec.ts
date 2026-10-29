import type { Membership } from "./membership.js";
import { routeSlugs } from "./route-slugs.js";

const member = (
  id: string,
  slug: string,
  accountRole: Membership["accountRole"],
): Membership =>
  ({
    workspace: { id, slug },
    accountRole,
  }) as Membership;

describe("routeSlugs", () => {
  it("sin choques, cada espacio usa su slug", () => {
    const slugs = routeSlugs([
      member("ws1", "tienda", "OWNER"),
      member("ws2", "cocina", null),
    ]);
    expect([...slugs.values()]).toEqual(["tienda", "cocina"]);
  });

  it("con el mismo slug, gana el de la cuenta donde soy Dueño, sin importar el orden", () => {
    const mine = member("zzzmio000001", "tienda", "OWNER");
    const other = member("aaaotro000002", "tienda", null);
    for (const list of [
      [mine, other],
      [other, mine],
    ]) {
      const slugs = routeSlugs(list);
      expect(slugs.get(mine.workspace.id)).toBe("tienda");
      expect(slugs.get(other.workspace.id)).toBe("tienda--000002");
    }
  });

  it("entre cuentas del mismo rango, desempata por id", () => {
    const first = member("aespacio000001", "tienda", "MEMBER");
    const second = member("bespacio000002", "tienda", "MEMBER");
    const slugs = routeSlugs([second, first]);
    expect(slugs.get(first.workspace.id)).toBe("tienda");
    expect(slugs.get(second.workspace.id)).toBe("tienda--000002");
  });
});
