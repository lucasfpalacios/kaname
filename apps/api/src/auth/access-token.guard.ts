import {
  type CanActivate,
  createParamDecorator,
  type ExecutionContext,
  Injectable,
} from "@nestjs/common";
import type { Request } from "express";
import { type AccessTokenPayload, AuthService } from "./auth.service.js";
import { ACCESS_COOKIE } from "./cookies.js";

export type AuthContext = { userId: string; sessionId: string };

type AuthedRequest = Request & { auth?: AuthContext };

// Exige un access token válido (cookie kaname_access) de una sesión viva. Deja el usuario y la
// sesión en request.auth, que se leen con @CurrentAuth().
@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
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
