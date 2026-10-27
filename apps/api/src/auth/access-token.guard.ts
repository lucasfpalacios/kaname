import {
  type CanActivate,
  createParamDecorator,
  type ExecutionContext,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { type AccessTokenPayload, AuthService } from "./auth.service.js";
import { ACCESS_COOKIE } from "./cookies.js";
import { IS_PUBLIC } from "./public.decorator.js";

export type AuthContext = { userId: string; sessionId: string };

export type AuthedRequest = Request & { auth?: AuthContext };

// Guard global (el primero de AppModule): toda ruta exige un access token válido (cookie
// kaname_access) de una sesión viva, salvo las marcadas con @Public(). Deja el usuario y la
// sesión en request.auth, que se leen con @CurrentAuth().
@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly auth: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    const request = context.switchToHttp().getRequest<AuthedRequest>();
    const payload: AccessTokenPayload = await this.auth.verifyAccess(
      request.cookies?.[ACCESS_COOKIE] as string | undefined,
    );
    request.auth = { userId: payload.sub, sessionId: payload.sid };
    return true;
  }
}

export const CurrentAuth = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthContext => {
    const request = context.switchToHttp().getRequest<AuthedRequest>();
    return request.auth as AuthContext;
  },
);
