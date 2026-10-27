import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ErrorCode } from "@kaname/shared";
import { can, isModuleEnabled } from "./membership.js";
import {
  REQUIRED_PERMISSION,
  type RequiredPermission,
  type WorkspaceRequest,
} from "./permissions.decorator.js";

// Guard global (tercero). Con @RequirePermission(módulo, acción), usa la membresía que dejó
// WorkspaceGuard: si el módulo está apagado en el espacio, 404 (para el usuario no existe); si
// el rol no tiene ese permiso en la matriz RolePermission, 403.
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const permission = this.reflector.getAllAndOverride<RequiredPermission>(
      REQUIRED_PERMISSION,
      [context.getHandler(), context.getClass()],
    );
    if (!permission) return true;

    const { workspace } = context.switchToHttp().getRequest<WorkspaceRequest>();
    if (!workspace) throw new NotFoundException(ErrorCode.notFound);
    if (!isModuleEnabled(workspace, permission.module)) {
      throw new NotFoundException(ErrorCode.notFound);
    }
    if (!can(workspace, permission.module, permission.action)) {
      throw new ForbiddenException(ErrorCode.forbidden);
    }
    return true;
  }
}
