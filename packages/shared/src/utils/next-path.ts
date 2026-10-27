// Destino después del login (?next=...), en la web y en el login con Google. Solo rutas del mismo
// sitio: tiene que empezar con "/" y no con "//" ni "/\" (que el navegador toma como otro
// dominio), y sin caracteres de control. Si no, se usa el fallback.
export function safeNextPath(value: string | null | undefined, fallback = "/") {
  if (!value || !value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;
  if ([...value].some((char) => char.charCodeAt(0) < 0x20)) return fallback;
  return value;
}
