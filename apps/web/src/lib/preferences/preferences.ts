import type { PreferencesInput, Theme } from "@kaname/shared";
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
/** true si se eligió un idioma sin sesión; lo borra (sirve una vez). */
export const takeLocaleChosen = () => take(CHOSEN_LOCALE);

// Lo mismo con el tema elegido en el login.
export const markThemeChosen = () => mark(CHOSEN_THEME);
export const takeThemeChosen = () => take(CHOSEN_THEME);

// Guardado del tema en curso. El cambio de idioma lo espera antes de navegar: el árbol del idioma
// nuevo arranca con las preferencias del servidor, y si el tema todavía no llegó (o falló) traería
// el anterior.
let pendingTheme: Promise<boolean> | null = null;

/** Guarda el tema en el usuario. Devuelve false si falló. */
export function saveTheme(theme: Theme): Promise<boolean> {
  const save = savePreferences({ theme });
  pendingTheme = save;
  void save.finally(() => {
    if (pendingTheme === save) pendingTheme = null;
  });
  return save;
}

/** Espera el guardado del tema en curso (si hay uno). */
export function waitForThemeSave(): Promise<boolean> {
  return pendingTheme ?? Promise.resolve(true);
}

// Las preferencias guardadas se aplican una vez por pestaña y usuario (al entrar, por ejemplo desde
// otro equipo). Después manda lo que la persona cambia en esta pestaña: un árbol de idioma nuevo no
// vuelve a aplicar lo del servidor, que puede estar atrasado.
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
    // Sin storage: se vuelven a aplicar en cada árbol nuevo, como antes.
  }
}
