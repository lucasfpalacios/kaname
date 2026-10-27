// Cambio de tema con "circular reveal": el tema nuevo aparece en un círculo que crece desde el
// botón hasta cubrir la pantalla, con View Transitions (sin dependencias). Si el navegador no las
// soporta o el sistema pide menos movimiento, el tema cambia al instante.

const DURATION_MS = 450;
/** Atributo en <html> mientras dura la transición: apaga el fundido por defecto (theme.css). */
const ACTIVE_ATTRIBUTE = "data-theme-transition";
/** Tope para esperar a que next-themes aplique la clase (lo hace en un efecto de React). */
const APPLY_TIMEOUT_MS = 300;

type ResolvedTheme = "light" | "dark";

export function canAnimateThemeChange(): boolean {
  return (
    typeof document !== "undefined" &&
    typeof document.startViewTransition === "function" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// Espera a que <html> tenga la clase del tema nuevo (next-themes la pone con attribute="class").
function waitForThemeClass(theme: ResolvedTheme): Promise<void> {
  const root = document.documentElement;
  if (root.classList.contains(theme)) return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => {
      observer.disconnect();
      clearTimeout(timer);
      resolve();
    };
    const observer = new MutationObserver(() => {
      if (root.classList.contains(theme)) done();
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    const timer = setTimeout(done, APPLY_TIMEOUT_MS);
  });
}

/** Radio desde el origen hasta la esquina más lejana de la ventana. */
function coveringRadius(x: number, y: number) {
  return Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );
}

/**
 * Cambia el tema con el círculo creciendo desde `origin` (el centro del botón).
 * `apply` cambia el tema (setTheme de next-themes); `target` es el tema que va a quedar.
 */
export function revealThemeChange({
  apply,
  target,
  origin,
}: {
  apply: () => void;
  target: ResolvedTheme;
  origin: { x: number; y: number };
}) {
  if (!canAnimateThemeChange()) {
    apply();
    return;
  }
  const root = document.documentElement;
  root.setAttribute(ACTIVE_ATTRIBUTE, "");
  const transition = document.startViewTransition(() => {
    apply();
    return waitForThemeClass(target);
  });

  const radius = coveringRadius(origin.x, origin.y);
  transition.ready
    .then(() => {
      root.animate(
        {
          clipPath: [
            `circle(0px at ${origin.x}px ${origin.y}px)`,
            `circle(${radius}px at ${origin.x}px ${origin.y}px)`,
          ],
        },
        {
          duration: DURATION_MS,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    })
    .catch(() => undefined);
  transition.finished
    .finally(() => root.removeAttribute(ACTIVE_ATTRIBUTE))
    .catch(() => undefined);
}
