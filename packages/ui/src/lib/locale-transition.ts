// Cambio de idioma con fundido y desenfoque: el contenido viejo se desenfoca y se desvanece mientras
// el nuevo aparece enfocándose (~300 ms), con View Transitions (los keyframes están en theme.css).
// Las dos vistas son la página entera en el mismo lugar, así que nada se mueve. Sin soporte de View
// Transitions o con prefers-reduced-motion, el idioma cambia al instante.

/** Atributo en <html> mientras dura la transición: activa la animación de theme.css. */
const ACTIVE_ATTRIBUTE = "data-locale-transition";
/** Tope para esperar el idioma nuevo: la navegación pide la página al servidor. */
const APPLY_TIMEOUT_MS = 2000;

/** La transición en curso: mientras actualiza, el render está congelado. */
let current: ViewTransition | null = null;

/**
 * Se resuelve cuando la vista nueva del cambio de idioma en curso ya está en pantalla (o enseguida
 * si no hay ninguno). Las animaciones del contenido nuevo (las letras del LocaleSwitch) esperan
 * esto: si arrancan antes, corren con el render congelado y no se ven.
 */
export function whenLocaleViewReady(): Promise<void> {
  return current
    ? current.updateCallbackDone.catch(() => undefined)
    : Promise.resolve();
}

export function canAnimateLocaleChange(): boolean {
  return (
    typeof document !== "undefined" &&
    typeof document.startViewTransition === "function" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// Espera a que <html lang> sea el del idioma nuevo (lo cambia el layout raíz al navegar).
function waitForLang(locale: string): Promise<void> {
  const root = document.documentElement;
  if (root.lang === locale) return Promise.resolve();
  return new Promise((resolve) => {
    // Sin requestAnimationFrame: mientras corre este callback la View Transition congela el render
    // y los frames no llegan (Chrome la cortaría por timeout).
    const done = () => {
      observer.disconnect();
      clearTimeout(timer);
      resolve();
    };
    const observer = new MutationObserver(() => {
      if (root.lang === locale) done();
    });
    observer.observe(root, { attributes: true, attributeFilter: ["lang"] });
    const timer = setTimeout(done, APPLY_TIMEOUT_MS);
  });
}

/**
 * Cambia el idioma con el fundido. `apply` navega al idioma nuevo (router.replace con el locale);
 * `target` es el idioma que va a quedar en <html lang>.
 */
export function fadeLocaleChange({
  apply,
  target,
}: {
  apply: () => void;
  target: string;
}) {
  if (!canAnimateLocaleChange()) {
    apply();
    return;
  }
  const root = document.documentElement;
  root.setAttribute(ACTIVE_ATTRIBUTE, "");
  const transition = document.startViewTransition(async () => {
    apply();
    await waitForLang(target);
    // El layout raíz vuelve a montar <html> con el idioma nuevo y React le saca los atributos que
    // no son suyos: sin esto, las animaciones de theme.css no se aplicarían.
    root.setAttribute(ACTIVE_ATTRIBUTE, "");
  });
  current = transition;
  transition.finished
    .finally(() => {
      root.removeAttribute(ACTIVE_ATTRIBUTE);
      if (current === transition) current = null;
    })
    .catch(() => undefined);
}
