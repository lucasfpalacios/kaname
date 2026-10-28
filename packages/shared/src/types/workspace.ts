import type { ModuleKey, SystemRoleKey, WorkspaceType } from "../enums.js";

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
  type: WorkspaceType;
  /** Acento del espacio (#rrggbb) o null. */
  color: string | null;
  logoUrl: string | null;
  archivedAt: string | null;
  role: { id: string; systemKey: SystemRoleKey | null; name: string };
  /** Módulos activos, en el orden del espacio. */
  modules: ModuleKey[];
  permissions: Partial<Record<ModuleKey, ModulePermissions>>;
};
