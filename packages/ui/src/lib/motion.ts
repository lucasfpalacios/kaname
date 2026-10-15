// Animaciones de entrada y salida con los keyframes de theme.css. Solo corren con
// motion-safe: si el sistema pide menos movimiento, los overlays aparecen sin animar.
// Radix espera a que termine la animación de salida antes de desmontar.
export const enterExit =
  "motion-safe:data-[state=open]:animate-enter motion-safe:data-[state=closed]:animate-exit";

export const fadeInOut = `${enterExit} [--kaname-enter-opacity:0] [--kaname-exit-opacity:0]`;

export const popInOut = `${fadeInOut} [--kaname-enter-scale:0.96] [--kaname-exit-scale:0.96]`;
