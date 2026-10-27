import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC = "kaname:public";

/**
 * Ruta sin sesión. Todo lo demás exige una sesión válida (AccessTokenGuard es global). Usar
 * solo en lo que de verdad se usa sin iniciar sesión: login, registro, refresh, health.
 */
export const Public = () => SetMetadata(IS_PUBLIC, true);
