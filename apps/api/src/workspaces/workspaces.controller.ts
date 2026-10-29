import { Body, Controller, Get, HttpCode, Patch, Post } from "@nestjs/common";
import {
  createWorkspaceSchema,
  type UpdateWorkspaceInput,
  updateWorkspaceSchema,
} from "@kaname/shared";
import type { z } from "zod";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import { type AuthContext, CurrentAuth } from "../auth/access-token.guard.js";
import type { Membership } from "./membership.js";
import { CurrentWorkspace, WorkspaceMember } from "./permissions.decorator.js";
import { WorkspaceAccessRepository } from "./workspace-access.repository.js";
import { routeSlugs } from "./route-slugs.js";
import { WorkspaceAdminService } from "./workspace-admin.service.js";

/** Un espacio con el rol del usuario, sus permisos y los módulos activos. */
export type WorkspaceSummary = Membership["workspace"] & {
  routeSlug: string;
  accountRole: Membership["accountRole"];
  role: Membership["role"];
  modules: Membership["modules"];
  permissions: Membership["permissions"];
};

export const toSummary = (
  membership: Membership,
  routeSlug: string,
): WorkspaceSummary => ({
  ...membership.workspace,
  routeSlug,
  accountRole: membership.accountRole,
  role: membership.role,
  modules: membership.modules,
  permissions: membership.permissions,
});

@Controller("workspaces")
export class WorkspacesController {
  constructor(
    private readonly access: WorkspaceAccessRepository,
    private readonly admin: WorkspaceAdminService,
  ) {}

  // Mis espacios (sin los archivados). Solo exige sesión.
  @Get()
  async list(@CurrentAuth() auth: AuthContext): Promise<WorkspaceSummary[]> {
    const memberships = await this.access.listMemberships(auth.userId);
    const slugs = routeSlugs(memberships);
    return memberships.map((m) => toSummary(m, slugs.get(m.workspace.id)!));
  }

  @Get(":workspaceId")
  @WorkspaceMember()
  get(
    @CurrentAuth() auth: AuthContext,
    @CurrentWorkspace() workspace: Membership,
  ): Promise<WorkspaceSummary> {
    return this.summary(auth.userId, workspace);
  }

  /** El resumen de un espacio con su dirección, que depende de todos los que veo. */
  private async summary(
    userId: string,
    membership: Membership,
  ): Promise<WorkspaceSummary> {
    const slugs = routeSlugs(await this.access.listMemberships(userId));
    return toSummary(
      membership,
      slugs.get(membership.workspace.id) ?? membership.workspace.slug,
    );
  }

  // Crear un espacio en una cuenta de la que soy Dueño. No es de un espacio: solo exige sesión.
  @Post()
  async create(
    @CurrentAuth() auth: AuthContext,
    @Body(new ZodValidationPipe(createWorkspaceSchema))
    body: z.output<typeof createWorkspaceSchema>,
  ): Promise<WorkspaceSummary> {
    return this.summary(
      auth.userId,
      await this.admin.create(auth.userId, body),
    );
  }

  // Configuración: miembro del espacio (si no, 404) y Dueño de la cuenta (si no, 403).
  @Patch(":workspaceId")
  @WorkspaceMember()
  async update(
    @CurrentAuth() auth: AuthContext,
    @CurrentWorkspace() workspace: Membership,
    @Body(new ZodValidationPipe(updateWorkspaceSchema))
    body: UpdateWorkspaceInput,
  ): Promise<WorkspaceSummary> {
    return this.summary(
      auth.userId,
      await this.admin.update(auth.userId, workspace, body),
    );
  }

  @Post(":workspaceId/archive")
  @WorkspaceMember()
  @HttpCode(204)
  archive(@CurrentWorkspace() workspace: Membership): Promise<void> {
    return this.admin.archive(workspace);
  }
}
