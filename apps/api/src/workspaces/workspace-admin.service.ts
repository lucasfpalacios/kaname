import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import {
  createWorkspaceSchema,
  DEFAULT_MODULES,
  ErrorCode,
  type UpdateWorkspaceInput,
} from "@kaname/shared";
import {
  ModuleKey,
  Prisma,
  SystemRoleKey,
} from "../generated/prisma/client.js";
import type { z } from "zod";
import { PrismaService } from "../prisma/prisma.service.js";
import type { Membership } from "./membership.js";
import { WorkspaceAccessRepository } from "./workspace-access.repository.js";

type Created = z.output<typeof createWorkspaceSchema>;

const slugTaken = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === "P2002";

// Alta, configuración y archivado de espacios. Solo el Dueño de la cuenta (AccountMember OWNER):
// un Colaborador o un Cliente del espacio recibe 403. El espacio de la ruta ya lo validó
// WorkspaceGuard (miembro, no archivado); acá se valida la cuenta.
@Injectable()
export class WorkspaceAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: WorkspaceAccessRepository,
  ) {}

  /**
   * Crea el espacio con los módulos por defecto de su tipo y deja al creador como Dueño. Una
   * cuenta de la que no es miembro: 404 (no revela que existe); miembro sin ser Dueño: 403.
   */
  async create(userId: string, input: Created): Promise<Membership> {
    const member = await this.prisma.accountMember.findUnique({
      where: { accountId_userId: { accountId: input.accountId, userId } },
    });
    if (!member) throw new NotFoundException(ErrorCode.notFound);
    if (member.role !== "OWNER") {
      throw new ForbiddenException(ErrorCode.forbidden);
    }
    const ownerRole = await this.prisma.role.findUnique({
      where: {
        accountId_systemKey: {
          accountId: input.accountId,
          systemKey: SystemRoleKey.OWNER,
        },
      },
    });
    // Toda cuenta tiene sus roles del sistema (seed y alta de cuentas).
    if (!ownerRole) throw new InternalServerErrorException();

    try {
      const workspace = await this.prisma.workspace.create({
        data: {
          accountId: input.accountId,
          name: input.name,
          slug: input.slug,
          type: input.type,
          color: input.color,
          baseCurrency: input.baseCurrency,
          modules: {
            create: DEFAULT_MODULES[input.type].map((module, sortOrder) => ({
              module,
              sortOrder,
            })),
          },
          members: { create: { userId, roleId: ownerRole.id } },
        },
      });
      return (await this.access.findMembership(userId, workspace.id))!;
    } catch (error) {
      if (slugTaken(error)) throw new ConflictException(ErrorCode.slugTaken);
      throw error;
    }
  }

  /** Datos generales, color y módulos activos. `modules` es la lista completa, en orden. */
  async update(
    userId: string,
    membership: Membership,
    input: UpdateWorkspaceInput,
  ): Promise<Membership> {
    this.assertOwner(membership);
    const workspaceId = membership.workspace.id;
    const { modules, ...fields } = input;
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.workspace.update({ where: { id: workspaceId }, data: fields });
        if (modules) {
          // El resumen es la página del espacio: siempre activo y primero.
          const enabled = [
            ModuleKey.DASHBOARD,
            ...modules.filter((module) => module !== ModuleKey.DASHBOARD),
          ];
          for (const module of Object.values(ModuleKey)) {
            const index = enabled.indexOf(module);
            const data = {
              enabled: index >= 0,
              sortOrder: index >= 0 ? index : enabled.length,
            };
            await tx.workspaceModule.upsert({
              where: { workspaceId_module: { workspaceId, module } },
              update: data,
              create: { workspaceId, module, ...data },
            });
          }
        }
      });
    } catch (error) {
      if (slugTaken(error)) throw new ConflictException(ErrorCode.slugTaken);
      throw error;
    }
    return (await this.access.findMembership(userId, workspaceId))!;
  }

  /** Archiva el espacio: deja de aparecer y su URL da 404 (WorkspaceAccessRepository). */
  async archive(membership: Membership): Promise<void> {
    this.assertOwner(membership);
    await this.prisma.workspace.update({
      where: { id: membership.workspace.id },
      data: { archivedAt: new Date() },
    });
  }

  private assertOwner(membership: Membership) {
    if (membership.accountRole !== "OWNER") {
      throw new ForbiddenException(ErrorCode.forbidden);
    }
  }
}
