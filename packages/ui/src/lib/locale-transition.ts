// Cambio de idioma con una cortina horizontal (View Transitions): la vista nueva entra desde un
// borde de la pantalla y barre hasta el otro, en la dirección de la píldora del switch (ES → EN,
// de izquierda a derecha; EN → ES, de derecha a izquierda). La vista vieja queda quieta debajo.
// Duración y easing: variables --kaname-locale-* de theme.css. Sin soporte de View Transitions o
// con prefers-reduced-motion, el idioma cambia al instante.

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

/** Duración (ms) y easing de la cortina, de las variables de theme.css. */
function curtainTiming() {
  const style = getComputedStyle(document.documentElement);
  // En "ms" o en "s": el minificador del build puede pasar 450ms a .45s.
  const raw = style.getPropertyValue("--kaname-locale-duration").trim();
  const duration = parseFloat(raw) * (raw.endsWith("ms") ? 1 : 1000);
  const easing = style.getPropertyValue("--kaname-locale-easing").trim();
  return {
    duration: Number.isFinite(duration) ? duration : 450,
    easing: easing || "ease-in-out",
  };
}

/**
 * clip-path de la cortina: arranca sin ancho en el borde de donde entra y termina cubriendo la
 * pantalla. "right": entra por la izquierda y barre hacia la derecha; "left", al revés.
 */
function curtainFrames(direction: "left" | "right") {
  const width = window.innerWidth;
  const from =
    direction === "right"
      ? `inset(0px ${width}px 0px 0px)`
      : `inset(0px 0px 0px ${width}px)`;
  return [{ clipPath: from }, { clipPath: "inset(0px 0px 0px 0px)" }];
}

/**
 * Cambia el idioma con la cortina. `apply` navega al idioma nuevo (router.replace con el locale);
 * `target` es el idioma que va a quedar en <html lang>; `direction`, hacia dónde va la píldora.
 */
export function revealLocaleChange({
  apply,
  target,
  direction,
}: {
  apply: () => void;
  target: string;
  direction: "left" | "right";
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
    // no son suyos: sin esto, las reglas de theme.css no se aplicarían.
    root.setAttribute(ACTIVE_ATTRIBUTE, "");
  });
  current = transition;
  transition.ready
    .then(() => {
      root.animate(curtainFrames(direction), {
        ...curtainTiming(),
        pseudoElement: "::view-transition-new(root)",
      });
    })
    .catch(() => undefined);
  transition.finished
    .finally(() => {
      root.removeAttribute(ACTIVE_ATTRIBUTE);
      if (current === transition) current = null;
    })
    .catch(() => undefined);
}
