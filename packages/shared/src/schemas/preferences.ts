import { z } from "zod";
import { localeSchema, themeSchema } from "../enums.js";
import { ErrorCode } from "../errors/codes.js";

// Preferencias del usuario (PATCH /api/me/preferences): idioma y tema. Se manda una o las dos;
// un body vacío no sirve.
export const preferencesSchema = z
  .object({
    locale: z.enum(localeSchema.options, ErrorCode.validationFailed).optional(),
    theme: z.enum(themeSchema.options, ErrorCode.validationFailed).optional(),
  })
  .refine(
    (value) => value.locale !== undefined || value.theme !== undefined,
    ErrorCode.validationFailed,
  );

export type PreferencesInput = z.infer<typeof preferencesSchema>;
