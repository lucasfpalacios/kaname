import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { AccessTokenGuard } from "./auth/access-token.guard.js";
import { AuthModule } from "./auth/auth.module.js";
import { validateEnv } from "./config/env.js";
import { HealthController } from "./health/health.controller.js";
import { MeModule } from "./me/me.module.js";
import { PrismaModule } from "./prisma/prisma.module.js";
import { PermissionGuard } from "./workspaces/permission.guard.js";
import { WorkspaceGuard } from "./workspaces/workspace.guard.js";
import { WorkspacesModule } from "./workspaces/workspaces.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    PrismaModule,
    AuthModule,
    WorkspacesModule,
    MeModule,
  ],
  controllers: [HealthController],
  // Guards globales, en este orden: sesión (salvo @Public()), membresía del espacio
  // (@RequirePermission / @WorkspaceMember) y permiso del rol con el módulo activo. Ver AGENTS.md,
  // "Proteger un endpoint".
  providers: [
    { provide: APP_GUARD, useExisting: AccessTokenGuard },
    { provide: APP_GUARD, useExisting: WorkspaceGuard },
    { provide: APP_GUARD, useExisting: PermissionGuard },
  ],
})
export class AppModule {}
