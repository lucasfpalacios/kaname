// /login con ?next= opcional. La URL no lleva el idioma.
export function loginPath(next?: string) {
  return next ? `/login?next=${encodeURIComponent(next)}` : "/login";
}
