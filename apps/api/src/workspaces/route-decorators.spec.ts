import { Controller, Get, Module } from "@nestjs/common";
import { Public } from "../auth/public.decorator.js";
import { ModuleKey } from "../generated/prisma/client.js";
import { createTestApp } from "../../test/support/create-app.js";
import { FakePrisma } from "../../test/support/fake-prisma.js";
import { RequirePermission, WorkspaceMember } from "./permissions.decorator.js";

@Controller("workspaces/:workspaceId/public-member")
class PublicMemberController {
  @Get()
  @Public()
  @WorkspaceMember()
  read() {
    return { leaked: true };
  }
}

@Public()
@Controller("workspaces/:workspaceId/public-products")
class PublicProductsController {
  @Get()
  @RequirePermission(ModuleKey.PRODUCTS, "view")
  list() {
    return { leaked: true };
  }
}

@Module({ controllers: [PublicMemberController] })
class PublicMemberModule {}

@Module({ controllers: [PublicProductsController] })
class PublicProductsModule {}

describe("@Public() con decoradores de espacio", () => {
  it("con @WorkspaceMember() en la misma ruta, la API no arranca", async () => {
    await expect(
      createTestApp(new FakePrisma(), { imports: [PublicMemberModule] }),
    ).rejects.toThrow(/PublicMemberController\.read/);
  });

  it("con @Public() en el controller y @RequirePermission() en la ruta, tampoco", async () => {
    await expect(
      createTestApp(new FakePrisma(), { imports: [PublicProductsModule] }),
    ).rejects.toThrow(/PublicProductsController\.list/);
  });

  it("las rutas de la app arrancan", async () => {
    const app = await createTestApp(new FakePrisma());
    await app.close();
  });
});
