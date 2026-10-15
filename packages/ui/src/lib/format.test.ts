import { describe, expect, it } from "vitest";
import { formatChange, formatDate, formatMoney } from "./format";

// Intl separa la moneda del número con un espacio duro; se normaliza para comparar.
const plain = (text: string) => text.replace(/\u00a0|\u202f/g, " ");

describe("formatMoney", () => {
  it("formatea ARS en es-AR con centavos", () => {
    expect(plain(formatMoney("4620000", { currency: "ARS" }))).toBe(
      "$ 4.620.000,00",
    );
  });

  it("no pierde precisión con montos grandes", () => {
    expect(plain(formatMoney("999999999999.99", { currency: "ARS" }))).toBe(
      "$ 999.999.999.999,99",
    );
  });

  it("oculta los centavos", () => {
    expect(
      plain(formatMoney("345000.5", { currency: "ARS", hideDecimals: true })),
    ).toBe("$ 345.001");
  });

  it("formatea USD en en-US y en notación corta", () => {
    expect(formatMoney("1234.5", { currency: "USD", locale: "en-US" })).toBe(
      "$1,234.50",
    );
    expect(
      formatMoney(4620000, { currency: "USD", locale: "en-US", compact: true }),
    ).toBe("$4.6M");
  });
});

describe("formatDate", () => {
  it("no corre una fecha sin hora al día anterior", () => {
    expect(
      formatDate("2026-10-24", { timeZone: "America/Argentina/Buenos_Aires" }),
    ).toBe("24/10/2026");
  });

  it("usa la zona horaria para fechas con hora", () => {
    expect(
      formatDate("2026-10-25T01:30:00Z", {
        format: "datetime",
        timeZone: "America/Argentina/Buenos_Aires",
      }),
    ).toBe("24/10/2026, 22:30");
  });

  it("formatea el día y el mes largos", () => {
    expect(formatDate("2026-10-24", { format: "long" })).toBe(
      "24 de octubre de 2026",
    );
    expect(formatDate("2026-10-24", { format: "long", locale: "en-US" })).toBe(
      "October 24, 2026",
    );
  });

  it("usa 24 h en español y 12 h en inglés", () => {
    const value = "2026-10-24T17:32:00Z";
    expect(formatDate(value, { format: "time", timeZone: "UTC" })).toBe(
      "17:32",
    );
    expect(
      formatDate(value, { format: "time", timeZone: "UTC", locale: "en-US" }),
    ).toBe("05:32 PM");
  });
});

describe("formatChange", () => {
  it("formatea porcentajes con signo", () => {
    expect(plain(formatChange("14.2"))).toBe("+14,2%");
    expect(formatChange("-2.1", { locale: "en-US" })).toBe("-2.1%");
    expect(plain(formatChange("0"))).toBe("0%");
  });

  it("usa la unidad si se pasa", () => {
    expect(formatChange("3.5", { unit: "pp" })).toBe("+3,5 pp");
  });
});
