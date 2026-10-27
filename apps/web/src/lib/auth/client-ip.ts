import { CLIENT_IP_HEADER, PROXY_SECRET_HEADER } from "@kaname/shared";

// IP real del cliente, del header que pone el proxy de adelante (CLIENT_IP_HEADER; en Vercel,
// x-real-ip). Sin ese header configurado no se confía en nada que mande el cliente: en local no
// hay proxy adelante y la IP que ve la API es la del propio servidor de Next, que es la del usuario.
export function clientIp(headers: Headers): string | undefined {
  const header = process.env.CLIENT_IP_HEADER;
  if (!header) return undefined;
  const value = headers.get(header)?.split(",")[0]?.trim();
  return value || undefined;
}

/**
 * Headers para pasarle a la API la IP del cliente, con el secreto compartido (PROXY_SHARED_SECRET,
 * el mismo que en la API). Sin IP o sin secreto, ninguno: la API usa la IP de la conexión.
 */
export function clientIpHeaders(
  ip: string | undefined,
): Record<string, string> {
  const secret = process.env.PROXY_SHARED_SECRET;
  if (!ip || !secret) return {};
  return { [CLIENT_IP_HEADER]: ip, [PROXY_SECRET_HEADER]: secret };
}
