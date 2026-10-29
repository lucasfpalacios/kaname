import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import {
  type ArchivedWorkspace,
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

/** Índice único que violó un P2002 (con el adapter de pg viene en driverAdapterError). */
function uniqueIndexOf(error: unknown): string | null {
  if (
    !(error instanceof Prisma.PrismaClientKnownRequestError) ||
    error.code !== "P2002"
  ) {
    return null;
  }
  const meta = error.meta as
    | { driverAdapterError?: { cause?: { constraint?: { index?: string } } } }
    | undefined;
  return meta?.driverAdapterError?.cause?.constraint?.index ?? "desconocido";
}

const SLUG_INDEX = "Workspace_accountId_slug_key";

/** El slug ya está en la cuenta (y no otro conflicto de unicidad). */
const slugTaken = (error: unknown) => uniqueIndexOf(error) === SLUG_INDEX;

/** Cualquier otro conflicto de unicidad: 409 con su código, nunca como slug_taken. */
function otherConflict(error: unknown) {
  return uniqueIndexOf(error)
    ? new ConflictException(ErrorCode.conflict)
    : null;
}

const notFound = () => new NotFoundException(ErrorCode.notFound);

// Alta, configuración y archivado de espacios. Solo el Dueño de la cuenta (AccountMember OWNER):
// un Colaborador o un Cliente del espacio recibe 403. El espacio de la ruta ya lo validó
// WorkspaceGuard (miembro, no archivado); acá se valida la cuenta.
type Tx = Prisma.TransactionClient;

/**
 * Deja activos exactamente `modules`, en ese orden, con el resumen siempre activo y primero. Bloquea
 * la fila del espacio hasta el final de la transacción: dos guardados simultáneos se hacen uno
 * detrás del otro (gana el último completo, sin mezclar filas de los dos). Son tres operaciones
 * en vez de un upsert por módulo: crear las filas que falten y un UPDATE con el estado y el orden.
 */
async function saveModules(tx: Tx, workspaceId: string, modules: ModuleKey[]) {
  const enabled = [
    ModuleKey.DASHBOARD,
    ...new Set(modules.filter((module) => module !== ModuleKey.DASHBOARD)),
  ];
  await tx.$executeRaw`SELECT 1 FROM "Workspace" WHERE "id" = ${workspaceId} FOR UPDATE`;
  await tx.workspaceModule.createMany({
    data: Object.values(ModuleKey).map((module) => ({
      workspaceId,
      module,
      enabled: false,
    })),
    skipDuplicates: true,
  });
  // Los activos toman su posición en la lista; los apagados quedan al final.
  await tx.$executeRaw`
    UPDATE "WorkspaceModule"
    SET "enabled" = "module"::text = ANY(${enabled}::text[]),
        "sortOrder" = COALESCE(array_position(${enabled}::text[], "module"::text) - 1, ${enabled.length})
    WHERE "workspaceId" = ${workspaceId}`;
}

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
    await this.assertAccountOwner(userId, input.accountId);
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
      if (slugTaken(error)) {
        throw await this.slugConflict(input.accountId, input.slug);
      }
      throw otherConflict(error) ?? error;
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
        if (modules) await saveModules(tx, workspaceId, modules);
      });
    } catch (error) {
      if (slugTaken(error) && fields.slug) {
        throw await this.slugConflict(
          membership.workspace.accountId,
          fields.slug,
        );
      }
      throw otherConflict(error) ?? error;
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

  /** Los archivados de una cuenta de la que soy Dueño, del más reciente al más viejo. */
  async listArchived(
    userId: string,
    accountId: string,
  ): Promise<ArchivedWorkspace[]> {
    await this.assertAccountOwner(userId, accountId);
    const rows = await this.prisma.workspace.findMany({
      where: { accountId, archivedAt: { not: null } },
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        color: true,
        archivedAt: true,
      },
      orderBy: { archivedAt: "desc" },
    });
    return rows.map((row) => ({
      ...row,
      archivedAt: row.archivedAt!.toISOString(),
    }));
  }

  /** Restaura un archivado de la cuenta. Uno activo, de otra cuenta o inexistente: 404. */
  async restore(
    userId: string,
    accountId: string,
    workspaceId: string,
  ): Promise<void> {
    await this.assertAccountOwner(userId, accountId);
    const { count } = await this.prisma.workspace.updateMany({
      where: { id: workspaceId, accountId, archivedAt: { not: null } },
      data: { archivedAt: null },
    });
    if (count === 0) throw notFound();
  }

  // El slug ya está en la cuenta: si es de un archivado, se dice cuál (para ofrecer restaurarlo).
  private async slugConflict(accountId: string, slug: string) {
    const existing = await this.prisma.workspace.findUnique({
      where: { accountId_slug: { accountId, slug } },
      select: { id: true, archivedAt: true },
    });
    return existing?.archivedAt
      ? new ConflictException({
          message: ErrorCode.slugArchived,
          workspaceId: existing.id,
        })
      : new ConflictException(ErrorCode.slugTaken);
  }

  /** Soy Dueño de la cuenta: si no soy miembro, 404 (no revela que existe); si no, 403. */
  private async assertAccountOwner(userId: string, accountId: string) {
    const member = await this.prisma.accountMember.findUnique({
      where: { accountId_userId: { accountId, userId } },
    });
    if (!member) throw notFound();
    if (member.role !== "OWNER") {
      throw new ForbiddenException(ErrorCode.forbidden);
    }
  }

  private assertOwner(membership: Membership) {
    if (membership.accountRole !== "OWNER") {
      throw new ForbiddenException(ErrorCode.forbidden);
    }
  }
}
