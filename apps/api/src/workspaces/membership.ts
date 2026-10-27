import type {
  ModuleKey,
  SystemRoleKey,
  WorkspaceType,
} from "../generated/prisma/client.js";

export type PermissionAction = "view" | "create" | "edit" | "delete";

export type ModulePermissions = Record<PermissionAction, boolean>;

/**
 * Lo que puede hacer un usuario en un espacio: su rol, la matriz de permisos de ese rol y los
 * módulos activos. Lo carga WorkspaceGuard en request.workspace (@CurrentWorkspace()).
 */
export type Membership = {
  workspace: {
    id: string;
    accountId: string;
    name: string;
    slug: string;
    type: WorkspaceType;
    color: string | null;
    logoUrl: string | null;
    archivedAt: Date | null;
  };
  role: { id: string; systemKey: SystemRoleKey | null; name: string };
  /** Módulos activos (WorkspaceModule.enabled), en el orden del espacio. */
  modules: ModuleKey[];
  /** Permisos del rol por módulo. Un módulo sin fila no permite nada. */
  permissions: Partial<Record<ModuleKey, ModulePermissions>>;
};

export function can(
  membership: Membership,
  module: ModuleKey,
  action: PermissionAction,
): boolean {
  return membership.permissions[module]?.[action] ?? false;
}

export const isModuleEnabled = (membership: Membership, module: ModuleKey) =>
  membership.modules.includes(module);
