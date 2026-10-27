import {
  createParamDecorator,
  type ExecutionContext,
  SetMetadata,
} from "@nestjs/common";
import type { ModuleKey } from "../generated/prisma/client.js";
import type { AuthedRequest } from "../auth/access-token.guard.js";
import type { Membership, PermissionAction } from "./membership.js";

export const REQUIRED_PERMISSION = "kaname:required-permission";
export const WORKSPACE_MEMBER = "kaname:workspace-member";

export type RequiredPermission = {
  module: ModuleKey;
  action: PermissionAction;
};

/**
 * La ruta (bajo /workspaces/:workspaceId) exige ser miembro del espacio, que el módulo esté
 * activo y que el rol tenga ese permiso. Sin membresía o con el módulo apagado: 404. Sin
 * permiso: 403.
 */
export const RequirePermission = (
  module: ModuleKey,
  action: PermissionAction,
) =>
  SetMetadata(REQUIRED_PERMISSION, {
    module,
    action,
  } satisfies RequiredPermission);

/**
 * La ruta (bajo /workspaces/:workspaceId) es para cualquier miembro del espacio, sin importar
 * el módulo (por ejemplo, los datos del propio espacio). Sin membresía: 404.
 */
export const WorkspaceMember = () => SetMetadata(WORKSPACE_MEMBER, true);

export type WorkspaceRequest = AuthedRequest & { workspace?: Membership };

/** El espacio de la ruta con el rol y los permisos del usuario (lo carga WorkspaceGuard). */
export const CurrentWorkspace = createParamDecorator(
  (_data: unknown, context: ExecutionContext): Membership => {
    const request = context.switchToHttp().getRequest<WorkspaceRequest>();
    return request.workspace as Membership;
  },
);
