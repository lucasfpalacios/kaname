import type { PreferencesInput, Theme } from "@kaname/shared";
import { LOCALE_COOKIE, type Locale } from "@/i18n/locale";
import { apiFetch } from "@/lib/api/browser";

// Preferencias del usuario desde el navegador (solo con sesión).
export async function savePreferences(input: PreferencesInput) {
  try {
    const response = await apiFetch("/api/me/preferences", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Idioma y tema elegidos sin sesión (en el login o el registro). Se anotan en la pestaña y, al
// entrar, PreferencesSync los guarda en el usuario en vez de aplicar los guardados. sessionStorage sobrevive
// a la vuelta del login con Google, que pasa por otra página en la misma pestaña.
const CHOSEN_LOCALE = "kaname:locale-chosen";
const CHOSEN_THEME = "kaname:theme-chosen";

function mark(key: string) {
  try {
    sessionStorage.setItem(key, "1");
  } catch {
    // Sin storage (modo privado estricto): queda la preferencia guardada.
  }
}

function take(key: string): boolean {
  try {
    const chosen = sessionStorage.getItem(key) === "1";
    sessionStorage.removeItem(key);
    return chosen;
  } catch {
    return false;
  }
}

export const markLocaleChosen = () => mark(CHOSEN_LOCALE);
/** true si se eligió un idioma sin sesión, sin borrarlo (el login lo consulta). */
export function isLocaleChosen(): boolean {
  try {
    return sessionStorage.getItem(CHOSEN_LOCALE) === "1";
  } catch {
    return false;
  }
}
/** true si se eligió un idioma sin sesión; lo borra (sirve una vez). */
export const takeLocaleChosen = () => take(CHOSEN_LOCALE);

// Lo mismo con el tema elegido en el login.
export const markThemeChosen = () => mark(CHOSEN_THEME);
export const takeThemeChosen = () => take(CHOSEN_THEME);

/** Guarda el tema en el usuario. Devuelve false si falló. */
export const saveTheme = (theme: Theme) => savePreferences({ theme });

/**
 * Fija el idioma de los próximos pedidos (i18n/request.ts lo lee). Un año: es la preferencia del
 * navegador; con sesión, la del usuario se vuelve a aplicar al entrar (PreferencesSync).
 */
export function setLocaleCookie(locale: Locale) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
}

// Las preferencias guardadas se aplican una vez por pestaña y usuario (al entrar, por ejemplo desde
// otro equipo). Después manda lo que la persona cambia en esta pestaña: una vuelta a renderizar
// con datos del servidor atrasados no las vuelve a aplicar.
const APPLIED_FOR = "kaname:preferences-applied";

export function preferencesAppliedFor(userId: string): boolean {
  try {
    return sessionStorage.getItem(APPLIED_FOR) === userId;
  } catch {
    return false;
  }
}

export function markPreferencesApplied(userId: string) {
  try {
    sessionStorage.setItem(APPLIED_FOR, userId);
  } catch {
    // Sin storage: se vuelven a aplicar cada vez que se monta el shell.
  }
}
