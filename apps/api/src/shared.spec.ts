import {
  Currency,
  ErrorCode,
  ModuleKey,
  moneySchema,
  signedMoneySchema,
} from "@kaname/shared";

describe("@kaname/shared", () => {
  it("expone los enums del dominio", () => {
    expect(Currency.USD).toBe("USD");
    expect(ModuleKey.ORDERS).toBe("ORDERS");
  });

  it("acepta montos como string decimal", () => {
    expect(
      moneySchema.safeParse({ amount: "1500.50", currency: Currency.ARS })
        .success,
    ).toBe(true);
  });

  it("rechaza montos como number", () => {
    expect(
      moneySchema.safeParse({ amount: 1500.5, currency: Currency.ARS }).success,
    ).toBe(false);
  });

  it("rechaza montos que no entran en Decimal(14, 2)", () => {
    const valido = { amount: "999999999999.99", currency: Currency.ARS };
    const largo = { amount: "1000000000000", currency: Currency.ARS };
    const tresDecimales = { amount: "10.555", currency: Currency.ARS };
    expect(moneySchema.safeParse(valido).success).toBe(true);
    expect(moneySchema.safeParse(largo).success).toBe(false);
    expect(moneySchema.safeParse(tresDecimales).success).toBe(false);
  });

  it("solo signedMoneySchema acepta negativos", () => {
    const negativo = { amount: "-250.00", currency: Currency.USD };
    expect(moneySchema.safeParse(negativo).success).toBe(false);
    expect(signedMoneySchema.safeParse(negativo).success).toBe(true);
  });

  it("devuelve un código de error, no un texto", () => {
    const result = moneySchema.safeParse({
      amount: "abc",
      currency: Currency.ARS,
    });
    expect(result.error?.issues[0]?.message).toBe(ErrorCode.moneyInvalid);
  });
});
