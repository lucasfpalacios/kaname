import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import {
  createProductSchema,
  generateVariantsSchema,
  productListQuerySchema,
  updateProductSchema,
} from "@kaname/shared";
import type { z } from "zod";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import { ModuleKey } from "../generated/prisma/client.js";
import type { Membership } from "../workspaces/membership.js";
import {
  CurrentWorkspace,
  RequirePermission,
} from "../workspaces/permissions.decorator.js";
import { ProductsService } from "./products.service.js";

// Productos de un espacio y sus combinaciones de variantes.
@Controller("workspaces/:workspaceId/products")
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  @RequirePermission(ModuleKey.PRODUCTS, "view")
  list(
    @CurrentWorkspace() workspace: Membership,
    @Query(new ZodValidationPipe(productListQuerySchema))
    query: z.output<typeof productListQuerySchema>,
  ) {
    return this.products.list(workspace.workspace.id, query);
  }

  @Post()
  @RequirePermission(ModuleKey.PRODUCTS, "create")
  create(
    @CurrentWorkspace() workspace: Membership,
    @Body(new ZodValidationPipe(createProductSchema))
    body: z.output<typeof createProductSchema>,
  ) {
    return this.products.create(workspace.workspace.id, body);
  }

  @Get(":productId")
  @RequirePermission(ModuleKey.PRODUCTS, "view")
  get(
    @CurrentWorkspace() workspace: Membership,
    @Param("productId") productId: string,
  ) {
    return this.products.get(workspace.workspace.id, productId);
  }

  @Patch(":productId")
  @RequirePermission(ModuleKey.PRODUCTS, "edit")
  update(
    @CurrentWorkspace() workspace: Membership,
    @Param("productId") productId: string,
    @Body(new ZodValidationPipe(updateProductSchema))
    body: z.output<typeof updateProductSchema>,
  ) {
    return this.products.update(workspace.workspace.id, productId, body);
  }

  @Delete(":productId")
  @RequirePermission(ModuleKey.PRODUCTS, "delete")
  @HttpCode(204)
  remove(
    @CurrentWorkspace() workspace: Membership,
    @Param("productId") productId: string,
  ) {
    return this.products.remove(workspace.workspace.id, productId);
  }

  /** Todas las combinaciones de las opciones y cuáles ya existen (para elegir cuáles crear). */
  @Get(":productId/combinations")
  @RequirePermission(ModuleKey.PRODUCTS, "view")
  combinations(
    @CurrentWorkspace() workspace: Membership,
    @Param("productId") productId: string,
  ) {
    return this.products.combinations(workspace.workspace.id, productId);
  }

  /** Crea variantes para las combinaciones elegidas. */
  @Post(":productId/variants")
  @RequirePermission(ModuleKey.PRODUCTS, "create")
  generate(
    @CurrentWorkspace() workspace: Membership,
    @Param("productId") productId: string,
    @Body(new ZodValidationPipe(generateVariantsSchema))
    body: z.output<typeof generateVariantsSchema>,
  ) {
    return this.products.generateVariants(
      workspace.workspace.id,
      productId,
      body,
    );
  }
}
