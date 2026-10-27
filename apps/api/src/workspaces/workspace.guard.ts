import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ErrorCode } from "@kaname/shared";
import { IS_PUBLIC } from "../auth/public.decorator.js";
import {
  REQUIRED_PERMISSION,
  type RequiredPermission,
  WORKSPACE_MEMBER,
  type WorkspaceRequest,
} from "./permissions.decorator.js";
import { WorkspaceAccessRepository } from "./workspace-access.repository.js";

// Guard global (segundo, después de la sesión). Si la ruta declara @RequirePermission o
// @WorkspaceMember, verifica que el usuario sea miembro del espacio de :workspaceId y deja su
// membresía en request.workspace. Si no es miembro o el espacio no existe: 404, el mismo en los
// dos casos, para no revelar que el espacio existe.
//
// Falla cerrado: una ruta con :workspaceId que no declara ninguno de los dos decoradores se
// rechaza (403) y queda en el log, así un endpoint nuevo nunca queda abierto por olvido.
@Injectable()
export class WorkspaceGuard implements CanActivate {
  private readonly logger = new Logger(WorkspaceGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly access: WorkspaceAccessRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, targets)) {
      return true;
    }
    const request = context.switchToHttp().getRequest<WorkspaceRequest>();
    const workspaceId = request.params?.workspaceId as string | undefined;
    const permission = this.reflector.getAllAndOverride<RequiredPermission>(
      REQUIRED_PERMISSION,
      targets,
    );
    const memberOnly = this.reflector.getAllAndOverride<boolean>(
      WORKSPACE_MEMBER,
      targets,
    );

    if (!permission && !memberOnly) {
      if (!workspaceId) return true;
      this.logger.error(
        `${request.method} ${request.path}: ruta de espacio sin @RequirePermission ni @WorkspaceMember`,
      );
      throw new ForbiddenException(ErrorCode.forbidden);
    }
    if (!workspaceId) {
      // Error de programación: un decorador de espacio en una ruta sin :workspaceId.
      throw new InternalServerErrorException();
    }

    const userId = request.auth?.userId;
    const membership = userId
      ? await this.access.findMembership(userId, workspaceId)
      : null;
    if (!membership) throw new NotFoundException(ErrorCode.notFound);
    request.workspace = membership;
    return true;
  }
}
