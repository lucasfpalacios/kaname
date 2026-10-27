import { Module } from "@nestjs/common";
import { PermissionGuard } from "./permission.guard.js";
import { WorkspaceGuard } from "./workspace.guard.js";
import { WorkspaceAccessRepository } from "./workspace-access.repository.js";
import { WorkspacesController } from "./workspaces.controller.js";

@Module({
  controllers: [WorkspacesController],
  providers: [WorkspaceAccessRepository, WorkspaceGuard, PermissionGuard],
  exports: [WorkspaceAccessRepository, WorkspaceGuard, PermissionGuard],
})
export class WorkspacesModule {}
