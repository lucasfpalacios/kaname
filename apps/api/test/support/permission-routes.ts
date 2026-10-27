import { Controller, Delete, Get, Module, Patch, Post } from "@nestjs/common";
import { ModuleKey } from "../../src/generated/prisma/client.js";
import type { Membership } from "../../src/workspaces/membership.js";
import {
  CurrentWorkspace,
  RequirePermission,
} from "../../src/workspaces/permissions.decorator.js";

// Rutas de prueba bajo /api/workspaces/:workspaceId, como las de un módulo de negocio. Solo se
// montan en los tests (createTestApp({ imports: [PermissionRoutesModule] })).

@Controller("workspaces/:workspaceId/test-products")
class TestProductsController {
  @Get()
  @RequirePermission(ModuleKey.PRODUCTS, "view")
  list(@CurrentWorkspace() workspace: Membership) {
    return { workspaceId: workspace.workspace.id, action: "view" };
  }

  @Post()
  @RequirePermission(ModuleKey.PRODUCTS, "create")
  create() {
    return { action: "create" };
  }

  @Patch(":id")
  @RequirePermission(ModuleKey.PRODUCTS, "edit")
  edit() {
    return { action: "edit" };
  }

  @Delete(":id")
  @RequirePermission(ModuleKey.PRODUCTS, "delete")
  remove() {
    return { action: "delete" };
  }
}

// CUSTOMERS está apagado en el espacio de prueba.
@Controller("workspaces/:workspaceId/test-customers")
class TestCustomersController {
  @Get()
  @RequirePermission(ModuleKey.CUSTOMERS, "view")
  list() {
    return { action: "view" };
  }
}

// Ruta de espacio sin @RequirePermission ni @WorkspaceMember: tiene que fallar cerrado.
@Controller("workspaces/:workspaceId/test-undeclared")
class TestUndeclaredController {
  @Get()
  list() {
    return { leaked: true };
  }
}

@Module({
  controllers: [
    TestProductsController,
    TestCustomersController,
    TestUndeclaredController,
  ],
})
export class PermissionRoutesModule {}
