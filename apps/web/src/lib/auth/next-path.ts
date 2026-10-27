// Destino después del login (?next=...). Solo rutas del mismo sitio: tiene que empezar con "/" y
// no con "//" ni "/\" (que el navegador toma como otro dominio). Si no, se usa el fallback.
export function safeNextPath(value: string | null | undefined, fallback = "/") {
  if (!value || !value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;
  if (/[\u0000-\u001f]/.test(value)) return fallback;
  return value;
}
