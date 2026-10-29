import { Module } from "@nestjs/common";
import { DiscoveryModule } from "@nestjs/core";
import { PermissionGuard } from "./permission.guard.js";
import { ArchivedWorkspacesController } from "./archived-workspaces.controller.js";
import { RouteDecoratorsCheck } from "./route-decorators.check.js";
import { WorkspaceAdminService } from "./workspace-admin.service.js";
import { WorkspaceGuard } from "./workspace.guard.js";
import { WorkspaceAccessRepository } from "./workspace-access.repository.js";
import { WorkspacesController } from "./workspaces.controller.js";

@Module({
  imports: [DiscoveryModule],
  controllers: [WorkspacesController, ArchivedWorkspacesController],
  providers: [
    WorkspaceAccessRepository,
    WorkspaceGuard,
    PermissionGuard,
    RouteDecoratorsCheck,
    WorkspaceAdminService,
  ],
  exports: [WorkspaceAccessRepository, WorkspaceGuard, PermissionGuard],
})
export class WorkspacesModule {}
