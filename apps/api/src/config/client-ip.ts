import { createHash, timingSafeEqual } from "node:crypto";
import { isIP } from "node:net";
import { CLIENT_IP_HEADER, PROXY_SECRET_HEADER } from "@kaname/shared";
import type { NextFunction, Request, Response } from "express";

const digest = (value: string) => createHash("sha256").update(value).digest();

// IP del cliente para el rate limit (req.ip). Express no confía en X-Forwarded-For (sin
// "trust proxy"): req.ip es la IP de la conexión. Solo si el pedido trae el secreto del proxy de
// Next, se usa la IP que Next manda en su header. Sin PROXY_SHARED_SECRET (en local) nunca se
// confía en un header.
export function clientIpMiddleware(secret: string | undefined) {
  const expected = secret ? digest(secret) : undefined;
  return (req: Request, _res: Response, next: NextFunction) => {
    const presented = req.get(PROXY_SECRET_HEADER);
    const ip = req.get(CLIENT_IP_HEADER)?.trim();
    if (
      expected &&
      presented &&
      timingSafeEqual(digest(presented), expected) &&
      ip &&
      isIP(ip)
    ) {
      Object.defineProperty(req, "ip", { value: ip, configurable: true });
    }
    next();
  };
}
