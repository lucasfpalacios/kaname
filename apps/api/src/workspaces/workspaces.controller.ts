import { Controller, Get } from "@nestjs/common";
import { type AuthContext, CurrentAuth } from "../auth/access-token.guard.js";
import type { Membership } from "./membership.js";
import { CurrentWorkspace, WorkspaceMember } from "./permissions.decorator.js";
import { WorkspaceAccessRepository } from "./workspace-access.repository.js";

/** Un espacio con el rol del usuario, sus permisos y los módulos activos. */
export type WorkspaceSummary = Membership["workspace"] & {
  role: Membership["role"];
  modules: Membership["modules"];
  permissions: Membership["permissions"];
};

const toSummary = (membership: Membership): WorkspaceSummary => ({
  ...membership.workspace,
  role: membership.role,
  modules: membership.modules,
  permissions: membership.permissions,
});

@Controller("workspaces")
export class WorkspacesController {
  constructor(private readonly access: WorkspaceAccessRepository) {}

  // Mis espacios (sin los archivados). Solo exige sesión.
  @Get()
  async list(@CurrentAuth() auth: AuthContext): Promise<WorkspaceSummary[]> {
    const memberships = await this.access.listMemberships(auth.userId);
    return memberships.map(toSummary);
  }

  @Get(":workspaceId")
  @WorkspaceMember()
  get(@CurrentWorkspace() workspace: Membership): WorkspaceSummary {
    return toSummary(workspace);
  }
}
