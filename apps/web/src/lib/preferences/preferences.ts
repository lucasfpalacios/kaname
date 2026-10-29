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

// Idioma elegido sin sesión (en el login o el registro). Se anota en la pestaña y, al entrar,
// PreferencesSync lo guarda en el usuario en vez de aplicar el guardado. sessionStorage sobrevive
// a la vuelta del login con Google, que pasa por otra página en la misma pestaña.
const CHOSEN_LOCALE = "kaname:locale-chosen";

export function markLocaleChosen() {
  try {
    sessionStorage.setItem(CHOSEN_LOCALE, "1");
  } catch {
    // Sin storage (modo privado estricto): queda el idioma guardado.
  }
}

/** true si se eligió un idioma sin sesión; lo borra (sirve una vez). */
export function takeLocaleChosen(): boolean {
  try {
    const chosen = sessionStorage.getItem(CHOSEN_LOCALE) === "1";
    sessionStorage.removeItem(CHOSEN_LOCALE);
    return chosen;
  } catch {
    return false;
  }
}

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
