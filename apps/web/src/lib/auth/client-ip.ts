// IP real del cliente, del header que pone el proxy de adelante (CLIENT_IP_HEADER; en Vercel,
// x-real-ip). Sin ese header configurado no se confía en nada que mande el cliente: en local no
// hay proxy adelante y la IP que ve la API es la del propio servidor de Next, que es la del usuario.
export function clientIp(headers: Headers): string | undefined {
  const header = process.env.CLIENT_IP_HEADER;
  if (!header) return undefined;
  const value = headers.get(header)?.split(",")[0]?.trim();
  return value || undefined;
}
