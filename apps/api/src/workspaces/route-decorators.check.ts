import { Injectable, type OnModuleInit } from "@nestjs/common";
import { DiscoveryService, MetadataScanner, Reflector } from "@nestjs/core";
import { IS_PUBLIC } from "../auth/public.decorator.js";
import {
  REQUIRED_PERMISSION,
  WORKSPACE_MEMBER,
} from "./permissions.decorator.js";

// Al arrancar, revisa todas las rutas: @Public() junto con @WorkspaceMember() o
// @RequirePermission() es un error de programación (la sesión no se exigiría y WorkspaceGuard
// dejaría pasar sin membresía). Si encuentra alguna, la API no arranca y dice cuáles.
@Injectable()
export class RouteDecoratorsCheck implements OnModuleInit {
  constructor(
    private readonly discovery: DiscoveryService,
    private readonly scanner: MetadataScanner,
    private readonly reflector: Reflector,
  ) {}

  onModuleInit() {
    const invalid: string[] = [];
    for (const { instance, metatype } of this.discovery.getControllers()) {
      if (!instance || !metatype) continue;
      const prototype = Object.getPrototypeOf(instance) as Record<
        string,
        () => unknown
      >;
      for (const method of this.scanner.getAllMethodNames(prototype)) {
        const targets = [prototype[method], metatype];
        const isPublic = this.reflector.getAllAndOverride<boolean>(
          IS_PUBLIC,
          targets,
        );
        const needsWorkspace =
          this.reflector.getAllAndOverride(REQUIRED_PERMISSION, targets) ||
          this.reflector.getAllAndOverride(WORKSPACE_MEMBER, targets);
        if (isPublic && needsWorkspace) {
          invalid.push(`${metatype.name}.${method}`);
        }
      }
    }
    if (invalid.length > 0) {
      throw new Error(
        `Rutas con @Public() y @WorkspaceMember() o @RequirePermission() a la vez: ${invalid.join(", ")}`,
      );
    }
  }
}
