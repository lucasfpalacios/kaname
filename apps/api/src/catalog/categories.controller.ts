import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { categorySchema, updateCategorySchema } from "@kaname/shared";
import type { z } from "zod";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import { ModuleKey } from "../generated/prisma/client.js";
import type { Membership } from "../workspaces/membership.js";
import {
  CurrentWorkspace,
  RequirePermission,
} from "../workspaces/permissions.decorator.js";
import { CategoriesService } from "./categories.service.js";

// Categorías del catálogo. Usan los permisos del módulo Productos.
@Controller("workspaces/:workspaceId/categories")
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  @RequirePermission(ModuleKey.PRODUCTS, "view")
  list(@CurrentWorkspace() workspace: Membership) {
    return this.categories.list(workspace.workspace.id);
  }

  @Post()
  @RequirePermission(ModuleKey.PRODUCTS, "create")
  create(
    @CurrentWorkspace() workspace: Membership,
    @Body(new ZodValidationPipe(categorySchema))
    body: z.output<typeof categorySchema>,
  ) {
    return this.categories.create(workspace.workspace.id, body);
  }

  @Patch(":categoryId")
  @RequirePermission(ModuleKey.PRODUCTS, "edit")
  update(
    @CurrentWorkspace() workspace: Membership,
    @Param("categoryId") categoryId: string,
    @Body(new ZodValidationPipe(updateCategorySchema))
    body: z.output<typeof updateCategorySchema>,
  ) {
    return this.categories.update(workspace.workspace.id, categoryId, body);
  }

  @Delete(":categoryId")
  @RequirePermission(ModuleKey.PRODUCTS, "delete")
  @HttpCode(204)
  remove(
    @CurrentWorkspace() workspace: Membership,
    @Param("categoryId") categoryId: string,
  ) {
    return this.categories.remove(workspace.workspace.id, categoryId);
  }
}
