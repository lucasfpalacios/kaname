import { ErrorCode } from "@kaname/shared";
import type { NextFunction, Request, Response } from "express";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

// Defensa contra CSRF además de SameSite=Lax (que deja pasar a otros subdominios del mismo sitio).
// En los métodos que cambian estado:
// - si el navegador manda Origin, tiene que ser uno de WEB_ORIGIN (si no, 403). Sin Origin pasa:
//   los navegadores siempre lo mandan en un POST entre sitios, y los pedidos del servidor de Next
//   no lo traen;
// - si hay body, tiene que ser JSON (si no, 415): un <form> de otro sitio solo manda
//   urlencoded, multipart o text/plain, nunca application/json.
// Un POST sin body (refresh, logout) llega con Content-Length: 0: eso no cuenta como body.
const hasBody = (req: Request) =>
  req.get("transfer-encoding") !== undefined ||
  Number(req.get("content-length") ?? 0) > 0;

export function sameOriginMiddleware(origins: string[]) {
  const allowed = new Set(origins);
  return (req: Request, res: Response, next: NextFunction) => {
    if (SAFE_METHODS.has(req.method)) return next();
    const origin = req.get("origin");
    if (origin !== undefined && !allowed.has(origin)) {
      res.status(403).json({
        statusCode: 403,
        message: ErrorCode.forbidden,
        error: "Forbidden",
      });
      return;
    }
    if (hasBody(req) && !req.is("application/json")) {
      res.status(415).json({
        statusCode: 415,
        message: ErrorCode.unsupportedMediaType,
        error: "Unsupported Media Type",
      });
      return;
    }
    next();
  };
}
