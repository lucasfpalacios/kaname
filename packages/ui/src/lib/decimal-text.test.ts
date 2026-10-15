import { describe, expect, it } from "vitest";
import { formatDecimal, parseDecimalText, toDraft } from "./decimal-text";

const money = { maxIntegerDigits: 12, maxDecimals: 2 };

describe("parseDecimalText", () => {
  it("toma la coma como decimal en es-AR", () => {
    expect(parseDecimalText("1234,5", "es-AR", money)).toEqual({
      draft: "1234,5",
      value: "1234.5",
    });
  });

  it("acepta el punto del teclado numérico como decimal", () => {
    expect(parseDecimalText("1234.5", "es-AR", money)).toEqual({
      draft: "1234,5",
      value: "1234.5",
    });
  });

  it("descarta los separadores de miles de un texto pegado", () => {
    expect(parseDecimalText("$ 1.234.567,89", "es-AR", money).value).toBe(
      "1234567.89",
    );
    expect(parseDecimalText("1,234,567.89", "en-US", money).value).toBe(
      "1234567.89",
    );
  });

  it("interpreta los separadores según el locale (es-AR)", () => {
    const cases = {
      "12.000": "12000",
      "1.234": "1234",
      "1.234,56": "1234.56",
      "12,5": "12.5",
      "12.5": "12.5",
      "0,99": "0.99",
      "1.234.567": "1234567",
    };
    for (const [text, value] of Object.entries(cases)) {
      expect(parseDecimalText(text, "es-AR", money).value, text).toBe(value);
    }
  });

  it("interpreta los separadores según el locale (en-US)", () => {
    const cases = {
      "1,234": "1234",
      "1,234.56": "1234.56",
      "12.5": "12.5",
      "12,000": "12000",
      "12,5": "12.5",
    };
    for (const [text, value] of Object.entries(cases)) {
      expect(parseDecimalText(text, "en-US", money).value, text).toBe(value);
    }
  });

  it("ignora espacios y símbolos al pegar", () => {
    expect(parseDecimalText("$ 12.000", "es-AR", money).value).toBe("12000");
    expect(parseDecimalText(" 1 234,56 ", "es-AR", money).value).toBe(
      "1234.56",
    );
    expect(parseDecimalText("US$ 1,234.56", "en-US", money).value).toBe(
      "1234.56",
    );
    expect(
      parseDecimalText("$ -1.500", "es-AR", { ...money, allowNegative: true })
        .value,
    ).toBe("-1500");
  });

  it("la tecla punto del teclado numérico escribe el separador del locale", () => {
    expect(parseDecimalText("12.", "es-AR", money)).toEqual({
      draft: "12,",
      value: "12",
    });
    expect(parseDecimalText("12,", "en-US", money).draft).toBe("12.");
  });

  it("corta los decimales y enteros que sobran", () => {
    expect(parseDecimalText("10,999", "es-AR", money).value).toBe("10.99");
    expect(parseDecimalText("1234567890123", "es-AR", money).value).toBe(
      "123456789012",
    );
  });

  it("deja el separador mientras se escribe, sin valor decimal", () => {
    expect(parseDecimalText("12,", "es-AR", money)).toEqual({
      draft: "12,",
      value: "12",
    });
    expect(parseDecimalText(",5", "es-AR", money).value).toBe("0.5");
  });

  it("devuelve null si queda vacío", () => {
    expect(parseDecimalText("", "es-AR", money).value).toBeNull();
    expect(parseDecimalText("abc", "es-AR", money).value).toBeNull();
  });

  it("saca los ceros a la izquierda", () => {
    expect(parseDecimalText("0007", "es-AR", money).value).toBe("7");
  });

  it("solo acepta negativos si se permite", () => {
    expect(parseDecimalText("-5", "es-AR", money).value).toBe("5");
    expect(
      parseDecimalText("-5", "es-AR", { ...money, allowNegative: true }).value,
    ).toBe("-5");
  });

  it("produce valores que acepta moneySchema", () => {
    const AMOUNT = /^\d{1,12}(\.\d{1,2})?$/;
    for (const text of ["0", ",5", "12,", "999999999999,99", "1.234,5"]) {
      expect(parseDecimalText(text, "es-AR", money).value).toMatch(AMOUNT);
    }
  });
});

describe("formatDecimal", () => {
  it("formatea con miles y dos decimales en es-AR", () => {
    expect(formatDecimal("1234.5", "es-AR", { min: 2, max: 2 })).toBe(
      "1.234,50",
    );
    expect(formatDecimal("999999999999.99", "es-AR", { min: 2, max: 2 })).toBe(
      "999.999.999.999,99",
    );
  });

  it("formatea en en-US", () => {
    expect(formatDecimal("1234.5", "en-US", { min: 2, max: 2 })).toBe(
      "1,234.50",
    );
  });

  it("devuelve vacío para null", () => {
    expect(formatDecimal(null, "es-AR", { min: 2, max: 2 })).toBe("");
  });
});

describe("toDraft", () => {
  it("usa el separador decimal del locale", () => {
    expect(toDraft("1234.5", "es-AR")).toBe("1234,5");
    expect(toDraft("1234.5", "en-US")).toBe("1234.5");
    expect(toDraft(null, "es-AR")).toBe("");
  });
});
