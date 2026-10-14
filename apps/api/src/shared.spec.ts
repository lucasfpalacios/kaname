import { Currency, ModuleKey, moneySchema } from '@kaname/shared';

describe('@kaname/shared', () => {
  it('expone los enums del dominio', () => {
    expect(Currency.USD).toBe('USD');
    expect(ModuleKey.ORDERS).toBe('ORDERS');
  });

  it('acepta montos como string decimal', () => {
    expect(
      moneySchema.safeParse({ amount: '1500.50', currency: Currency.ARS })
        .success,
    ).toBe(true);
  });

  it('rechaza montos como number', () => {
    expect(
      moneySchema.safeParse({ amount: 1500.5, currency: Currency.ARS }).success,
    ).toBe(false);
  });
});
