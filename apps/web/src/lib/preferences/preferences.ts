import type { PreferencesInput } from "@kaname/shared";
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
