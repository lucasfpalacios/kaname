import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Resuelve el idioma (URL, cookie NEXT_LOCALE o Accept-Language) y redirige si hace falta.
export default createMiddleware(routing);

export const config = {
  // Todo menos API, internos de Next y archivos con extensión.
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
