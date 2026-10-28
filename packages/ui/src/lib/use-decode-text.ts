"use client";

import { useEffect, useState } from "react";
import { whenLocaleViewReady } from "./locale-transition";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DURATION_MS = 320;
const FRAME_MS = 40;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Efecto de "decodificación": cuando `from` tiene valor, el texto pasa de `from` a `text` letra
 * por letra (cada letra muestra letras al azar hasta quedar fija, de izquierda a derecha). Sin
 * `from`, o con prefers-reduced-motion, muestra `text` directo.
 */
export function useDecodeText(text: string, from: string | undefined) {
  // Cuadro de la animación en curso; null: sin animación, se ve `text`.
  const [frame, setFrame] = useState<string | null>(
    from && from !== text ? from : null,
  );

  useEffect(() => {
    if (!from || from === text || prefersReducedMotion()) return;
    const length = Math.max(text.length, from.length);
    let start = 0;
    let timer: ReturnType<typeof setInterval> | undefined;
    let cancelled = false;
    // Si hay un cambio de idioma en curso, arranca cuando la vista nueva ya se ve.
    void whenLocaleViewReady().then(() => {
      if (cancelled) return;
      start = performance.now();
      timer = setInterval(tick, FRAME_MS);
    });
    function tick() {
      const progress = (performance.now() - start) / DURATION_MS;
      if (progress >= 1) {
        setFrame(null);
        clearInterval(timer);
        return;
      }
      let next = "";
      for (let index = 0; index < length; index++) {
        // La letra i queda fija cuando el progreso pasa su parte del total.
        const settled = progress >= (index + 1) / (length + 1);
        next += settled
          ? (text[index] ?? "")
          : LETTERS[Math.floor(Math.random() * LETTERS.length)];
      }
      setFrame(next);
    }
    return () => {
      cancelled = true;
      clearInterval(timer);
      setFrame(null);
    };
  }, [text, from]);

  // Con menos movimiento, el texto final desde el primer render.
  return frame !== null && !prefersReducedMotion() ? frame : text;
}
