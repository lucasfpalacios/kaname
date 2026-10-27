import { CLIENT_IP_HEADER, PROXY_SECRET_HEADER } from "@kaname/shared";

/** Headers de un pedido que pasa por el proxy de Next desde esa IP (con el secreto de setup-env). */
export const fromIp = (ip: string) => ({
  [CLIENT_IP_HEADER]: ip,
  [PROXY_SECRET_HEADER]: process.env.PROXY_SHARED_SECRET!,
});
