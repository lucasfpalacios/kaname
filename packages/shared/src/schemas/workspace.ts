import { z } from "zod";
import {
  currencySchema,
  type ModuleKey,
  moduleKeySchema,
  type WorkspaceType,
  workspaceTypeSchema,
} from "../enums.js";
import { ErrorCode } from "../errors/codes.js";

// Alta y configuración de espacios (POST /api/workspaces, PATCH /api/workspaces/:workspaceId).

/** Slug: minúsculas, números y guiones simples ("tank-vault-tcg"). Va en la URL (/w/[slug]). */
export const WORKSPACE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const name = z
  .string(ErrorCode.nameRequired)
  .trim()
  .min(1, ErrorCode.nameRequired)
  .max(80, ErrorCode.validationFailed);

const slug = z
  .string(ErrorCode.slugInvalid)
  .trim()
  .toLowerCase()
  .min(2, ErrorCode.slugInvalid)
  .max(48, ErrorCode.slugInvalid)
  .regex(WORKSPACE_SLUG_PATTERN, ErrorCode.slugInvalid);

// Solo #rrggbb (va a un style inline, ver WorkspaceAccent en el kit); se guarda en minúsculas.
// null = acento por defecto del tema.
const color = z
  .string(ErrorCode.colorInvalid)
  .regex(/^#[0-9a-f]{6}$/i, ErrorCode.colorInvalid)
  .transform((value) => value.toLowerCase())
  .nullable();

const type = z.enum(workspaceTypeSchema.options, ErrorCode.validationFailed);
const baseCurrency = z.enum(currencySchema.options, ErrorCode.validationFailed);

export const createWorkspaceSchema = z.object({
  /** Cuenta donde se crea: el usuario tiene que ser su Dueño. */
  accountId: z
    .string(ErrorCode.validationFailed)
    .min(1, ErrorCode.validationFailed),
  name,
  slug,
  type,
  color: color.default(null),
  baseCurrency: baseCurrency.default("ARS"),
});

export type CreateWorkspaceInput = z.input<typeof createWorkspaceSchema>;

// Cada campo es opcional; `modules` es la lista completa de módulos activos, en orden (el resumen
// siempre queda activo). Un body vacío no sirve.
export const updateWorkspaceSchema = z
  .object({
    name: name.optional(),
    slug: slug.optional(),
    type: type.optional(),
    color: color.optional(),
    baseCurrency: baseCurrency.optional(),
    modules: z
      .array(z.enum(moduleKeySchema.options, ErrorCode.validationFailed))
      .max(moduleKeySchema.options.length, ErrorCode.validationFailed)
      .optional(),
  })
  .refine(
    (value) => Object.values(value).some((field) => field !== undefined),
    ErrorCode.validationFailed,
  );

export type UpdateWorkspaceInput = z.input<typeof updateWorkspaceSchema>;

/** Módulos que se activan al crear un espacio, según su tipo. El resumen va siempre primero. */
export const DEFAULT_MODULES: Record<WorkspaceType, ModuleKey[]> = {
  BUSINESS: [
    "DASHBOARD",
    "PRODUCTS",
    "CUSTOMERS",
    "SUPPLIERS",
    "PRICE_LISTS",
    "ORDERS",
    "CALCULATOR",
    "CALENDAR",
  ],
  PROJECTS: [
    "DASHBOARD",
    "CUSTOMERS",
    "PROJECTS",
    "QUOTES",
    "DOCUMENTS",
    "CALENDAR",
  ],
};

/** "Tank Vault TCG" → "tank-vault-tcg", "VISIÓ" → "visio". Para sugerir el slug desde el nombre. */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/, "");
}
