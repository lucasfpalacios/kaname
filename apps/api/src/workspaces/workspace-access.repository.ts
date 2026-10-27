import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import type { Membership, ModulePermissions } from "./membership.js";

const include = {
  workspace: {
    include: {
      modules: { where: { enabled: true }, orderBy: { sortOrder: "asc" } },
    },
  },
  role: { include: { permissions: true } },
} as const;

type MemberRow = Awaited<
  ReturnType<WorkspaceAccessRepository["findRows"]>
>[number];

// Toda la información de acceso de un usuario a sus espacios sale de acá, en una consulta:
// membresía, rol con su matriz de permisos y módulos activos. Solo por membresía
// (WorkspaceMember): ni el superadmin ni el dueño de la cuenta tienen acceso implícito. Un espacio
// archivado no aparece: entrando directo responde 404, igual que uno inexistente.
@Injectable()
export class WorkspaceAccessRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMembership(
    userId: string,
    workspaceId: string,
  ): Promise<Membership | null> {
    const [row] = await this.findRows(userId, workspaceId);
    return row ? toMembership(row) : null;
  }

  /** Los espacios del usuario, sin los archivados. */
  async listMemberships(userId: string): Promise<Membership[]> {
    const rows = await this.findRows(userId);
    return rows.map(toMembership);
  }

  private findRows(userId: string, workspaceId?: string) {
    return this.prisma.workspaceMember.findMany({
      where: {
        userId,
        ...(workspaceId ? { workspaceId } : {}),
        workspace: { archivedAt: null },
      },
      include,
      orderBy: { workspace: { name: "asc" } },
    });
  }
}

function toMembership(row: MemberRow): Membership {
  const { workspace, role } = row;
  const permissions: Membership["permissions"] = {};
  for (const permission of role.permissions) {
    const entry: ModulePermissions = {
      view: permission.canView,
      create: permission.canCreate,
      edit: permission.canEdit,
      delete: permission.canDelete,
    };
    permissions[permission.module] = entry;
  }
  return {
    workspace: {
      id: workspace.id,
      accountId: workspace.accountId,
      name: workspace.name,
      slug: workspace.slug,
      type: workspace.type,
      color: workspace.color,
      logoUrl: workspace.logoUrl,
      archivedAt: workspace.archivedAt,
    },
    role: { id: role.id, systemKey: role.systemKey, name: role.name },
    modules: workspace.modules.map((module) => module.module),
    permissions,
  };
}
