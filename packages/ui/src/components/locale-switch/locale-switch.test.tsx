// @vitest-environment jsdom
import { Activity, act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LocaleSwitch } from "./locale-switch";

// Al cambiar de idioma, Next monta el árbol del idioma nuevo o vuelve a mostrar el que dejó
// oculto si ya se visitó. En los dos casos el switch tiene que animar desde el idioma anterior:
// las letras del elegido arrancan con las del otro y terminan en las suyas.

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

type Locale = "es" | "en";
const OPTIONS = [
  { value: "es", short: "ES", name: "Español" },
  { value: "en", short: "EN", name: "English" },
];

let root: Root;
let container: HTMLDivElement;

function App({ visible }: { visible: Locale }) {
  return (
    <>
      {(["es", "en"] as const).map((locale) => (
        <Activity key={locale} mode={visible === locale ? "visible" : "hidden"}>
          <div data-locale={locale}>
            <LocaleSwitch
              label="Idioma"
              value={locale}
              options={OPTIONS}
              onValueChange={(next) => void show(next as Locale)}
            />
          </div>
        </Activity>
      ))}
    </>
  );
}

const show = (visible: Locale) =>
  act(() => root.render(<App visible={visible} />));

/** Letras de los segmentos del árbol visible ("ES|EN"). */
const letters = (locale: Locale) =>
  [...container.querySelectorAll(`[data-locale="${locale}"] [role="radio"]`)]
    .map((radio) => radio.textContent)
    .join("|");

/** Cambia de idioma con el switch visible, como lo haría la persona. */
async function switchTo(from: Locale, to: Locale) {
  const radio = container.querySelector<HTMLButtonElement>(
    `[data-locale="${from}"] [role="radio"][value="${to}"]`,
  )!;
  await act(async () => radio.click());
}

beforeEach(() => {
  vi.useFakeTimers();
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  })) as unknown as typeof window.matchMedia;
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(() => root.unmount());
  container.remove();
  vi.useRealTimers();
});

describe("LocaleSwitch al cambiar de idioma", () => {
  it("anima desde el idioma anterior también al volver a un árbol ya visitado", async () => {
    await show("es");
    for (const [from, to] of [
      ["es", "en"],
      ["en", "es"],
      ["es", "en"],
      ["en", "es"],
    ] as const) {
      await switchTo(from, to);
      // Arranca con las letras del idioma anterior en el segmento elegido...
      const index = to === "en" ? 1 : 0;
      expect(letters(to).split("|")[index]).toBe(from.toUpperCase());
      // ...y termina en las suyas.
      await act(async () => vi.advanceTimersByTimeAsync(500));
      expect(letters(to)).toBe("ES|EN");
    }
  });
});
