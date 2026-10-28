import { Body, Controller, Get, Patch } from "@nestjs/common";
import {
  type AccountSummary,
  type PreferencesInput,
  preferencesSchema,
} from "@kaname/shared";
import { type AuthContext, CurrentAuth } from "../auth/access-token.guard.js";
import { type PublicUser, toPublicUser } from "../auth/auth.service.js";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import { PrismaService } from "../prisma/prisma.service.js";

// Lo del usuario con sesión que no es de un espacio. Sin decorador: exige sesión.
@Controller("me")
export class MeController {
  constructor(private readonly prisma: PrismaService) {}

  // Mis cuentas y mi rol en cada una: la web ofrece "Nuevo espacio" en las que soy Dueño.
  @Get("accounts")
  async accounts(@CurrentAuth() auth: AuthContext): Promise<AccountSummary[]> {
    const members = await this.prisma.accountMember.findMany({
      where: { userId: auth.userId },
      include: { account: { select: { name: true } } },
      orderBy: { account: { name: "asc" } },
    });
    return members.map((member) => ({
      id: member.accountId,
      name: member.account.name,
      role: member.role,
    }));
  }

  // Idioma y tema guardados en el usuario: la web los aplica al entrar desde cualquier equipo.
  @Patch("preferences")
  async updatePreferences(
    @CurrentAuth() auth: AuthContext,
    @Body(new ZodValidationPipe(preferencesSchema)) body: PreferencesInput,
  ): Promise<PublicUser> {
    const user = await this.prisma.user.update({
      where: { id: auth.userId },
      data: { locale: body.locale, theme: body.theme },
    });
    return toPublicUser(user);
  }
}
