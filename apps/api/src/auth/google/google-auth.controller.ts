import {
  Controller,
  Get,
  NotFoundException,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ThrottlerGuard } from "@nestjs/throttler";
import { ErrorCode } from "@kaname/shared";
import type { CookieOptions, Request, Response } from "express";
import type { Env } from "../../config/env.js";
import { setAuthCookies } from "../cookies.js";
import { Public } from "../public.decorator.js";
import { SessionRateLimit } from "../rate-limit.js";
import { GoogleAuthService } from "./google-auth.service.js";
import { OAUTH_STATE_TTL_SECONDS } from "./oauth-state.js";

const STATE_COOKIE = "kaname_oauth";

// Las redirecciones son relativas: el navegador llega por el proxy de Next (/api/*), así que
// resuelven contra el origen de la web.
@Controller("auth/google")
export class GoogleAuthController {
  private readonly secure: boolean;
  private readonly accessTtlSeconds: number;

  constructor(
    private readonly google: GoogleAuthService,
    config: ConfigService<Env, true>,
  ) {
    this.secure = config.get("NODE_ENV", { infer: true }) === "production";
    this.accessTtlSeconds = config.get("ACCESS_TOKEN_TTL_SECONDS", {
      infer: true,
    });
  }

  // La cookie solo viaja al callback. SameSite=Lax: la vuelta desde Google es una navegación GET
  // de primer nivel, así que el navegador la manda.
  private stateCookie(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.secure,
      sameSite: "lax",
      path: "/api/auth/google",
    };
  }

  @Public()
  @Get()
  @UseGuards(ThrottlerGuard)
  start(@Query("next") next: string | undefined, @Res() res: Response) {
    const credentials = this.google.credentials();
    if (!credentials) throw new NotFoundException(ErrorCode.notFound);
    const { url, sealedState } = this.google.start(credentials, next);
    res.cookie(STATE_COOKIE, sealedState, {
      ...this.stateCookie(),
      maxAge: OAUTH_STATE_TTL_SECONDS * 1000,
    });
    res.redirect(302, url);
  }

  @Public()
  @Get("callback")
  @SessionRateLimit()
  async callback(
    @Query() query: { code?: string; state?: string; error?: string },
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const credentials = this.google.credentials();
    if (!credentials) throw new NotFoundException(ErrorCode.notFound);
    // La cookie del flujo sirve una sola vez, salga bien o mal.
    res.clearCookie(STATE_COOKIE, this.stateCookie());
    const result = await this.google.callback(
      credentials,
      {
        code: typeof query.code === "string" ? query.code : undefined,
        state: typeof query.state === "string" ? query.state : undefined,
        error: typeof query.error === "string" ? query.error : undefined,
      },
      req.cookies?.[STATE_COOKIE] as string | undefined,
      req.get("user-agent"),
    );
    if (result.ok) {
      setAuthCookies(res, result.tokens, {
        secure: this.secure,
        accessTtlSeconds: this.accessTtlSeconds,
      });
      res.redirect(302, result.next);
      return;
    }
    res.redirect(302, `/login?error=${encodeURIComponent(result.code)}`);
  }
}
