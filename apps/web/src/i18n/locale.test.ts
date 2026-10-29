import { describe, expect, it } from "vitest";
import { localeFromAcceptLanguage, resolveLocale } from "./locale";

describe("resolveLocale", () => {
  it("la cookie gana sobre el navegador", () => {
    expect(resolveLocale("en", "es-AR,es;q=0.9")).toBe("en");
    expect(resolveLocale("es", "en-US")).toBe("es");
  });

  it("sin cookie (o con una inválida), el primer idioma soportado del navegador", () => {
    expect(resolveLocale(undefined, "en-US,en;q=0.9,es;q=0.8")).toBe("en");
    expect(resolveLocale("fr", "fr-FR,fr;q=0.9,en;q=0.5")).toBe("en");
    expect(resolveLocale(undefined, "de;q=0.2,es;q=0.9,en;q=0.5")).toBe("es");
  });

  it("si nada sirve, español", () => {
    expect(resolveLocale(undefined, null)).toBe("es");
    expect(resolveLocale(undefined, "fr-FR,de")).toBe("es");
    expect(localeFromAcceptLanguage("en;q=0")).toBeUndefined();
  });
});
