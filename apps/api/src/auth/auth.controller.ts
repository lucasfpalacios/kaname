import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ThrottlerGuard } from "@nestjs/throttler";
import {
  ErrorCode,
  type LoginInput,
  loginSchema,
  type RegisterInput,
  registerSchema,
} from "@kaname/shared";
import type { Request, Response } from "express";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import type { Env } from "../config/env.js";
import {
  type AuthContext,
  AccessTokenGuard,
  CurrentAuth,
} from "./access-token.guard.js";
import { AuthService, type PublicUser } from "./auth.service.js";
import {
  ACCESS_COOKIE,
  clearAuthCookies,
  REFRESH_COOKIE,
  setAuthCookies,
} from "./cookies.js";

@Controller("auth")
export class AuthController {
  private readonly secureCookies: boolean;
  private readonly registrationEnabled: boolean;

  constructor(
    private readonly auth: AuthService,
    config: ConfigService<Env, true>,
  ) {
    this.secureCookies =
      config.get("NODE_ENV", { infer: true }) === "production";
    this.registrationEnabled = config.get("REGISTRATION_ENABLED", {
      infer: true,
    });
  }

  // Limitado por IP y por email (throttlers "ip" y "email" de AuthModule).
  @Post("login")
  @HttpCode(200)
  @UseGuards(ThrottlerGuard)
  async login(
    @Body(new ZodValidationPipe(loginSchema)) body: LoginInput,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PublicUser> {
    const { user, tokens } = await this.auth.login(body, req.get("user-agent"));
    setAuthCookies(res, tokens, this.secureCookies);
    return user;
  }

  // Cerrado salvo que REGISTRATION_ENABLED sea "true": por ahora las cuentas se crean con el
  // seed. Se chequea antes de validar el body, así un registro cerrado no revela nada.
  @Post("register")
  @HttpCode(201)
  @UseGuards(ThrottlerGuard)
  async register(
    @Body() rawBody: unknown,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PublicUser> {
    if (!this.registrationEnabled) {
      throw new ForbiddenException(ErrorCode.registrationDisabled);
    }
    const body: RegisterInput = new ZodValidationPipe(registerSchema).transform(
      rawBody,
    );
    const { user, tokens } = await this.auth.register(
      body,
      req.get("user-agent"),
    );
    setAuthCookies(res, tokens, this.secureCookies);
    return user;
  }

  @Post("refresh")
  @HttpCode(204)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    try {
      const tokens = await this.auth.refresh(
        req.cookies?.[REFRESH_COOKIE] as string | undefined,
        req.get("user-agent"),
      );
      setAuthCookies(res, tokens, this.secureCookies);
    } catch (error) {
      // Un refresh inválido deja al cliente sin sesión: se borran las cookies.
      clearAuthCookies(res, this.secureCookies);
      throw error;
    }
  }

  @Post("logout")
  @HttpCode(204)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const sessionId = await this.auth
      .verifyAccess(req.cookies?.[ACCESS_COOKIE] as string | undefined)
      .then((payload) => payload.sid)
      .catch(() => undefined);
    await this.auth.logout(
      req.cookies?.[REFRESH_COOKIE] as string | undefined,
      sessionId,
    );
    clearAuthCookies(res, this.secureCookies);
  }

  @Get("me")
  @UseGuards(AccessTokenGuard)
  me(@CurrentAuth() auth: AuthContext): Promise<PublicUser> {
    return this.auth.me(auth.userId);
  }
}
