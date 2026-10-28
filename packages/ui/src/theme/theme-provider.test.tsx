// @vitest-environment jsdom
import { Activity, act, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { ThemeChoice } from "../components/theme-toggle";
import { ThemeProvider, useTheme } from "./theme-provider";

// Cambiar de idioma no puede cambiar el tema. Next conserva oculta la página del idioma anterior
// (<Activity mode="hidden">), con su propio ThemeProvider: al volver a ese idioma se vuelve a
// mostrar con el tema que tenía cuando se ocultó. Acá se arma lo mismo: un árbol por idioma.

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

type Locale = "es" | "en";
const setters: Partial<Record<Locale, (theme: ThemeChoice) => void>> = {};

function ExposeSetTheme({ locale }: { locale: Locale }) {
  const { setTheme } = useTheme();
  useEffect(() => {
    setters[locale] = setTheme;
  }, [locale, setTheme]);
  return null;
}

function App({ visible }: { visible: Locale }) {
  return (
    <>
      {(["es", "en"] as const).map((locale) => (
        <Activity key={locale} mode={visible === locale ? "visible" : "hidden"}>
          <ThemeProvider>
            <ExposeSetTheme locale={locale} />
          </ThemeProvider>
        </Activity>
      ))}
    </>
  );
}

const htmlTheme = () => {
  const { classList } = document.documentElement;
  return classList.contains("dark")
    ? "dark"
    : classList.contains("light")
      ? "light"
      : "-";
};

let root: Root;
const show = (visible: Locale) =>
  act(() => root.render(<App visible={visible} />));
const choose = (locale: Locale, theme: ThemeChoice) =>
  act(() => setters[locale]!(theme));

beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = "";
  // jsdom no trae matchMedia (next-themes lo usa para "sistema").
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
  })) as unknown as typeof window.matchMedia;
  root = createRoot(document.createElement("div"));
});

afterEach(() => act(() => root.unmount()));

describe("ThemeProvider al cambiar de idioma", () => {
  for (const [before, after] of [
    ["light", "dark"],
    ["dark", "light"],
  ] as const) {
    it(`con ${before} en EN y ${after} elegido en ES, volver a EN queda en ${after}`, async () => {
      // EN con un tema; al pasar a ES la página EN queda oculta con ese tema.
      await show("en");
      await choose("en", before);
      await show("es");
      expect(htmlTheme()).toBe(before);

      await choose("es", after);
      expect(htmlTheme()).toBe(after);
      await show("en");
      expect(htmlTheme()).toBe(after);
      await show("es");
      expect(htmlTheme()).toBe(after);
      expect(localStorage.getItem("theme")).toBe(after);
    });
  }

  it("con tema de sistema, cambiar de idioma lo deja en sistema", async () => {
    await show("en");
    await choose("en", "dark");
    await show("es");
    await choose("es", "system");
    await show("en");
    expect(localStorage.getItem("theme")).toBe("system");
    expect(htmlTheme()).toBe("light");
  });
});
