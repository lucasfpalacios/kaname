import {
  createWorkspaceSchema,
  Currency,
  ErrorCode,
  ModuleKey,
  moneySchema,
  signedMoneySchema,
  slugify,
  updateWorkspaceSchema,
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

describe("schemas de espacios", () => {
  it("slugify arma la dirección desde el nombre", () => {
    expect(slugify("Tank Vault TCG")).toBe("tank-vault-tcg");
    expect(slugify("VISIÓ")).toBe("visio");
    expect(slugify("  Café & Té  ")).toBe("cafe-te");
    expect(slugify("---")).toBe("");
  });

  it("alta: normaliza slug y color, y completa moneda y color por defecto", () => {
    const parsed = createWorkspaceSchema.parse({
      accountId: "cuenta",
      name: " Mi tienda ",
      slug: "Mi-Tienda",
      type: "BUSINESS",
    });
    expect(parsed).toMatchObject({
      name: "Mi tienda",
      slug: "mi-tienda",
      color: null,
      baseCurrency: "ARS",
    });
    expect(
      createWorkspaceSchema.safeParse({
        accountId: "cuenta",
        name: "x",
        slug: "mi--tienda",
        type: "BUSINESS",
      }).success,
    ).toBe(false);
  });

  it("edición: al menos un campo, color #rrggbb o null", () => {
    expect(updateWorkspaceSchema.safeParse({}).success).toBe(false);
    expect(updateWorkspaceSchema.parse({ color: "#ABCDEF" }).color).toBe(
      "#abcdef",
    );
    expect(updateWorkspaceSchema.parse({ color: null }).color).toBeNull();
    expect(updateWorkspaceSchema.safeParse({ color: "red" }).success).toBe(
      false,
    );
  });
});
