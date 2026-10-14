import type messages from "../../messages/es.json";
import type { routing } from "./routing";

// Tipa useTranslations / getTranslations: una clave inexistente es error de compilación.
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
