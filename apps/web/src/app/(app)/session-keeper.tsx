"use client";

import { useEffect } from "react";
import { apiFetch } from "@/lib/api/browser";

// Al volver a la pestaña después de un rato, el access pudo haber vencido. Se consulta la sesión
// con el cliente de la API: si venció, se renueva con el refresh (de a un pedido por vez); si ya
// no se puede, va a /login. Las navegaciones ya las cubre el proxy del servidor.
const MIN_INTERVAL_MS = 60_000;

export function SessionKeeper() {
  useEffect(() => {
    let last = Date.now();
    function check() {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - last < MIN_INTERVAL_MS) return;
      last = Date.now();
      void apiFetch("/api/auth/me").catch(() => undefined);
    }
    document.addEventListener("visibilitychange", check);
    window.addEventListener("focus", check);
    return () => {
      document.removeEventListener("visibilitychange", check);
      window.removeEventListener("focus", check);
    };
  }, []);
  return null;
}
