import { Module } from "@nestjs/common";
import { DiscoveryModule } from "@nestjs/core";
import { PermissionGuard } from "./permission.guard.js";
import { RouteDecoratorsCheck } from "./route-decorators.check.js";
import { WorkspaceGuard } from "./workspace.guard.js";
import { WorkspaceAccessRepository } from "./workspace-access.repository.js";
import { WorkspacesController } from "./workspaces.controller.js";

@Module({
  imports: [DiscoveryModule],
  controllers: [WorkspacesController],
  providers: [
    WorkspaceAccessRepository,
    WorkspaceGuard,
    PermissionGuard,
    RouteDecoratorsCheck,
  ],
  exports: [WorkspaceAccessRepository, WorkspaceGuard, PermissionGuard],
})
export class WorkspacesModule {}
