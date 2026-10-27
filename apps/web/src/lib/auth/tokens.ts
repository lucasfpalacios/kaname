import { REFRESH_SKEW_SECONDS } from "./constants";

// Vencimiento del access token (claim exp del JWT), sin verificar la firma: solo sirve para
// decidir si conviene renovarlo antes de usarlo. La firma la verifica la API en cada pedido.
export function accessTokenExpiry(token: string | undefined): number | null {
  const payload = token?.split(".")[1];
  if (!payload) return null;
  try {
    const json: unknown = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    );
    const exp = (json as { exp?: unknown }).exp;
    return typeof exp === "number" ? exp * 1000 : null;
  } catch {
    return null;
  }
}

/** true si el access existe y le quedan más de REFRESH_SKEW_SECONDS. */
export function isAccessFresh(token: string | undefined, now = Date.now()) {
  const expiry = accessTokenExpiry(token);
  return expiry !== null && expiry - now > REFRESH_SKEW_SECONDS * 1000;
}

export type ParsedCookie = {
  name: string;
  value: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite?: "lax" | "strict" | "none";
  path?: string;
  maxAge?: number;
  expires?: Date;
};

// Una línea Set-Cookie de la API, para volver a ponerla desde el proxy con los mismos atributos.
export function parseSetCookie(line: string): ParsedCookie | null {
  const [pair, ...attributes] = line.split(";").map((part) => part.trim());
  const index = pair?.indexOf("=") ?? -1;
  if (!pair || index <= 0) return null;
  const cookie: ParsedCookie = {
    name: pair.slice(0, index),
    value: decodeURIComponent(pair.slice(index + 1)),
    httpOnly: false,
    secure: false,
  };
  for (const attribute of attributes) {
    const [rawKey, ...rest] = attribute.split("=");
    const key = rawKey.toLowerCase();
    const value = rest.join("=");
    if (key === "httponly") cookie.httpOnly = true;
    else if (key === "secure") cookie.secure = true;
    else if (key === "path") cookie.path = value;
    else if (key === "max-age") cookie.maxAge = Number(value);
    else if (key === "expires") cookie.expires = new Date(value);
    else if (key === "samesite") {
      const sameSite = value.toLowerCase();
      if (sameSite === "lax" || sameSite === "strict" || sameSite === "none") {
        cookie.sameSite = sameSite;
      }
    }
  }
  return cookie;
}
