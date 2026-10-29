import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  type categorySchema,
  ErrorCode,
  type updateCategorySchema,
} from "@kaname/shared";
import type { z } from "zod";
import { uniqueIndexOf } from "../common/prisma-errors.js";
import { PrismaService } from "../prisma/prisma.service.js";

export type CategorySummary = {
  id: string;
  name: string;
  parentId: string | null;
  productCount: number;
};

const NAME_INDEX = "Category_workspaceId_name_parentId_key";

// Categorías de un espacio, con un solo nivel de jerarquía: una categoría raíz puede tener
// subcategorías, y una subcategoría no puede tener hijas. El nombre es único por espacio y padre.
// Todo se busca con { id, workspaceId }: el guard valida el espacio, no la categoría.
@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(workspaceId: string): Promise<CategorySummary[]> {
    const rows = await this.prisma.category.findMany({
      where: { workspaceId },
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    });
    return rows.map(({ _count, ...category }) => ({
      id: category.id,
      name: category.name,
      parentId: category.parentId,
      productCount: _count.products,
    }));
  }

  async create(
    workspaceId: string,
    input: z.output<typeof categorySchema>,
  ): Promise<CategorySummary> {
    await this.assertParent(workspaceId, input.parentId);
    try {
      const category = await this.prisma.category.create({
        data: { workspaceId, name: input.name, parentId: input.parentId },
      });
      return { ...pick(category), productCount: 0 };
    } catch (error) {
      throw nameConflict(error) ?? error;
    }
  }

  async update(
    workspaceId: string,
    categoryId: string,
    input: z.output<typeof updateCategorySchema>,
  ): Promise<CategorySummary> {
    const category = await this.find(workspaceId, categoryId);
    if (input.parentId !== undefined && input.parentId !== null) {
      if (input.parentId === category.id) {
        throw new BadRequestException(ErrorCode.categoryDepth);
      }
      await this.assertParent(workspaceId, input.parentId);
      // Pasar a ser hija con hijas propias haría dos niveles.
      const children = await this.prisma.category.count({
        where: { workspaceId, parentId: category.id },
      });
      if (children > 0) throw new BadRequestException(ErrorCode.categoryDepth);
    }
    try {
      const updated = await this.prisma.category.update({
        where: { id: category.id },
        data: { name: input.name, parentId: input.parentId },
        include: { _count: { select: { products: true } } },
      });
      return { ...pick(updated), productCount: updated._count.products };
    } catch (error) {
      throw nameConflict(error) ?? error;
    }
  }

  /** Borra la categoría; sus productos quedan sin categoría. Con subcategorías: 409. */
  async remove(workspaceId: string, categoryId: string): Promise<void> {
    const category = await this.find(workspaceId, categoryId);
    const children = await this.prisma.category.count({
      where: { workspaceId, parentId: category.id },
    });
    if (children > 0) {
      throw new ConflictException(ErrorCode.categoryHasChildren);
    }
    await this.prisma.category.delete({ where: { id: category.id } });
  }

  private async find(workspaceId: string, categoryId: string) {
    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, workspaceId },
    });
    if (!category) throw new NotFoundException(ErrorCode.notFound);
    return category;
  }

  // El padre tiene que ser una categoría raíz del mismo espacio. Uno de otro espacio o inexistente
  // da el mismo error: no revela que existe.
  private async assertParent(workspaceId: string, parentId: string | null) {
    if (parentId === null) return;
    const parent = await this.prisma.category.findFirst({
      where: { id: parentId, workspaceId },
    });
    if (!parent) throw new BadRequestException(ErrorCode.categoryInvalid);
    if (parent.parentId) throw new BadRequestException(ErrorCode.categoryDepth);
  }
}

const pick = (category: {
  id: string;
  name: string;
  parentId: string | null;
}) => ({
  id: category.id,
  name: category.name,
  parentId: category.parentId,
});

function nameConflict(error: unknown) {
  return uniqueIndexOf(error) === NAME_INDEX
    ? new ConflictException(ErrorCode.categoryNameTaken)
    : null;
}
