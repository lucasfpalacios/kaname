import { z } from "zod";
import { currencySchema } from "../enums.js";
import { ErrorCode } from "../errors/codes.js";

// El dinero viaja como string decimal, nunca como number, para no perder precisión antes de
// llegar a Prisma.Decimal. Hasta 12 enteros y 2 decimales: entra en las columnas Decimal(14, 2).
const AMOUNT = /^\d{1,12}(\.\d{1,2})?$/;
const SIGNED_AMOUNT = /^-?\d{1,12}(\.\d{1,2})?$/;

// Montos que no pueden ser negativos: precios, costos, totales, pagos.
export const moneySchema = z.object({
  amount: z.string().regex(AMOUNT, ErrorCode.moneyInvalid),
  currency: currencySchema,
});

// Montos que sí pueden ser negativos: ajustes y diferencias.
export const signedMoneySchema = z.object({
  amount: z.string().regex(SIGNED_AMOUNT, ErrorCode.moneyInvalid),
  currency: currencySchema,
});

export type Money = z.infer<typeof moneySchema>;
