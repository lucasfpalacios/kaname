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
import { stockAdjustmentSchema, updateVariantSchema } from "@kaname/shared";
import type { z } from "zod";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import { ModuleKey } from "../generated/prisma/client.js";
import type { Membership } from "../workspaces/membership.js";
import {
  CurrentWorkspace,
  RequirePermission,
} from "../workspaces/permissions.decorator.js";
import { ProductsService } from "./products.service.js";

// Variantes y su stock. El stock no se edita: cambia con ajustes, que dejan su movimiento.
@Controller("workspaces/:workspaceId/variants")
export class VariantsController {
  constructor(private readonly products: ProductsService) {}

  @Patch(":variantId")
  @RequirePermission(ModuleKey.PRODUCTS, "edit")
  update(
    @CurrentWorkspace() workspace: Membership,
    @Param("variantId") variantId: string,
    @Body(new ZodValidationPipe(updateVariantSchema))
    body: z.output<typeof updateVariantSchema>,
  ) {
    return this.products.updateVariant(workspace.workspace.id, variantId, body);
  }

  @Delete(":variantId")
  @RequirePermission(ModuleKey.PRODUCTS, "delete")
  @HttpCode(204)
  remove(
    @CurrentWorkspace() workspace: Membership,
    @Param("variantId") variantId: string,
  ) {
    return this.products.removeVariant(workspace.workspace.id, variantId);
  }

  // Ajustar el stock es editar el producto (no crear ni borrar).
  @Post(":variantId/stock-adjustments")
  @RequirePermission(ModuleKey.PRODUCTS, "edit")
  adjust(
    @CurrentWorkspace() workspace: Membership,
    @Param("variantId") variantId: string,
    @Body(new ZodValidationPipe(stockAdjustmentSchema))
    body: z.output<typeof stockAdjustmentSchema>,
  ) {
    return this.products.adjustStock(workspace.workspace.id, variantId, body);
  }

  @Get(":variantId/stock-movements")
  @RequirePermission(ModuleKey.PRODUCTS, "view")
  movements(
    @CurrentWorkspace() workspace: Membership,
    @Param("variantId") variantId: string,
  ) {
    return this.products.movements(workspace.workspace.id, variantId);
  }
}
