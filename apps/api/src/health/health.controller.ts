import { Controller, Get, Res } from "@nestjs/common";
import type { Response } from "express";
import { Public } from "../auth/public.decorator.js";
import { PrismaService } from "../prisma/prisma.service.js";

export type Health = { ok: boolean; database: "up" | "down" };

// Estado de la API y de la base. Sin base responde 503, así un health check del hosting la marca
// como caída en vez de mandarle tráfico que va a dar 500.
@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  async check(@Res({ passthrough: true }) res: Response): Promise<Health> {
    const up = await this.prisma.isReachable();
    if (!up) res.status(503);
    return { ok: up, database: up ? "up" : "down" };
  }
}
