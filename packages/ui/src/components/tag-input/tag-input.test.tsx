// @vitest-environment jsdom
import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TagInput } from "./tag-input";

// Los valores se suman con Enter, con coma o pegando una lista separada por comas; sin repetidos
// (sin importar mayúsculas) y sin pasar del máximo.

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;
let container: HTMLDivElement;

function Field({ initial, max }: { initial: string[]; max?: number }) {
  const [value, setValue] = useState(initial);
  return (
    <TagInput
      value={value}
      onChange={setValue}
      removeLabel={(tag) => `Quitar ${tag}`}
      max={max}
      aria-label="Valores"
    />
  );
}

const input = () => container.querySelector("input")!;
/** Los valores que se ven (chips). */
const tags = () =>
  [...container.querySelectorAll('[data-slot="tag-input"] > span')].map(
    (chip) => chip.textContent,
  );

/** Escribe como lo hace el navegador: el valor nuevo y el evento input que lee React. */
function type(text: string) {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )!.set!;
  act(() => {
    setter.call(input(), text);
    input().dispatchEvent(new Event("input", { bubbles: true }));
  });
}

function press(key: string) {
  act(() => {
    input().dispatchEvent(
      new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }),
    );
  });
}

beforeEach(() => {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("TagInput", () => {
  it("suma con Enter y no repite (sin importar mayúsculas)", () => {
    act(() => root.render(<Field initial={["EN"]} />));
    type("es");
    press("Enter");
    type("en");
    press("Enter");
    expect(tags()).toEqual(["EN", "es"]);
    expect(input().value).toBe("");
  });

  it("al pegar una lista separada por comas suma cada valor y deja lo último escrito", () => {
    act(() => root.render(<Field initial={[]} />));
    type("NM, LP , MP,HP");
    expect(tags()).toEqual(["NM", "LP", "MP"]);
    expect(input().value).toBe("HP");
  });

  it("no pasa del máximo y Backspace con el campo vacío saca el último", () => {
    act(() => root.render(<Field initial={["A"]} max={2} />));
    type("B, C,");
    expect(tags()).toEqual(["A", "B"]);
    press("Backspace");
    expect(tags()).toEqual(["A"]);
  });
});
