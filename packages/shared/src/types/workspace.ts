import type {
  AccountRole,
  Currency,
  ModuleKey,
  SystemRoleKey,
  WorkspaceType,
} from "../enums.js";

/** Permisos de un rol en un módulo. */
export type ModulePermissions = Record<
  "view" | "create" | "edit" | "delete",
  boolean
>;

/** Un espacio del usuario, como lo devuelven GET /api/workspaces y /api/workspaces/:id. */
export type WorkspaceSummary = {
  id: string;
  accountId: string;
  name: string;
  slug: string;
  /**
   * Dirección en la web (/w/<routeSlug>): el slug, salvo que otro espacio que veo (de otra cuenta)
   * lo comparta; ahí "slug--<sufijo del id>". La calcula la API.
   */
  routeSlug: string;
  type: WorkspaceType;
  /** Acento del espacio (#rrggbb) o null. */
  color: string | null;
  logoUrl: string | null;
  baseCurrency: Currency;
  archivedAt: string | null;
  /** Mi rol en la cuenta del espacio: solo el Dueño (OWNER) lo configura y lo archiva. */
  accountRole: AccountRole | null;
  role: { id: string; systemKey: SystemRoleKey | null; name: string };
  /** Módulos activos, en el orden del espacio. */
  modules: ModuleKey[];
  permissions: Partial<Record<ModuleKey, ModulePermissions>>;
};

/** Una cuenta mía (GET /api/me/accounts): donde puedo crear espacios si soy su Dueño. */
export type AccountSummary = { id: string; name: string; role: AccountRole };

/** Un espacio archivado (GET /api/accounts/:accountId/archived-workspaces). */
export type ArchivedWorkspace = {
  id: string;
  name: string;
  slug: string;
  type: WorkspaceType;
  color: string | null;
  archivedAt: string;
};
