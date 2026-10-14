import { z } from "zod";
import { currencySchema } from "../enums.js";

// El dinero viaja como string decimal (hasta 2 decimales), nunca como number,
// para no perder precisión antes de llegar a Prisma.Decimal.
export const moneySchema = z.object({
  amount: z.string().regex(/^-?\d+(\.\d{1,2})?$/, "Monto inválido"),
  currency: currencySchema,
});

export type Money = z.infer<typeof moneySchema>;
