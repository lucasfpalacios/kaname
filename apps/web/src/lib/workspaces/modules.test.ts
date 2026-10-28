import { describe, expect, it } from "vitest";
import { moduleFromSegment, workspaceInitials, workspacePath } from "./modules";

describe("rutas de módulos", () => {
  it("arma la ruta de cada módulo y la vuelve a leer", () => {
    expect(workspacePath("tank-vault")).toBe("/w/tank-vault");
    expect(workspacePath("tank-vault", "PRICE_LISTS")).toBe(
      "/w/tank-vault/price-lists",
    );
    expect(moduleFromSegment("price-lists")).toBe("PRICE_LISTS");
    expect(moduleFromSegment("")).toBeNull();
    expect(moduleFromSegment("PRODUCTS")).toBeNull();
    expect(moduleFromSegment("no-existe")).toBeNull();
  });

  it("iniciales del espacio", () => {
    expect(workspaceInitials("Tank Vault TCG")).toBe("TV");
    expect(workspaceInitials("Disanza")).toBe("DI");
    expect(workspaceInitials("  visió  ")).toBe("VI");
  });
});
