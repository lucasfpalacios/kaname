import { Controller, Get, HttpCode, Param, Post } from "@nestjs/common";
import type { ArchivedWorkspace } from "@kaname/shared";
import { type AuthContext, CurrentAuth } from "../auth/access-token.guard.js";
import { WorkspaceAdminService } from "./workspace-admin.service.js";

// Espacios archivados de una cuenta, para su Dueño. No van bajo /workspaces/:workspaceId: el
// guard de espacio responde 404 a los archivados (y así tiene que seguir para todo lo demás).
// El servicio valida la cuenta: 404 si no soy miembro, 403 si no soy su Dueño.
@Controller("accounts/:accountId/archived-workspaces")
export class ArchivedWorkspacesController {
  constructor(private readonly admin: WorkspaceAdminService) {}

  @Get()
  list(
    @CurrentAuth() auth: AuthContext,
    @Param("accountId") accountId: string,
  ): Promise<ArchivedWorkspace[]> {
    return this.admin.listArchived(auth.userId, accountId);
  }

  // Vuelve a aparecer para sus miembros, con su slug, sus módulos y sus datos.
  @Post(":archivedWorkspaceId/restore")
  @HttpCode(204)
  restore(
    @CurrentAuth() auth: AuthContext,
    @Param("accountId") accountId: string,
    @Param("archivedWorkspaceId") archivedWorkspaceId: string,
  ): Promise<void> {
    return this.admin.restore(auth.userId, accountId, archivedWorkspaceId);
  }
}
