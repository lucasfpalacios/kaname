import type messages from "../../messages/es.json";
import type { Locale } from "./locale";

// Tipa useTranslations / getTranslations: una clave inexistente es error de compilación.
declare module "next-intl" {
  interface AppConfig {
    Locale: Locale;
    Messages: typeof messages;
  }
}
