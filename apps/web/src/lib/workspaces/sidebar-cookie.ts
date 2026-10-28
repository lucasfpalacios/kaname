// Cookie con el estado del sidebar (fijado o colapsado). La lee el servidor al armar la página,
// así el sidebar sale con el ancho correcto desde el primer render, sin parpadeo.
export const SIDEBAR_COOKIE = "kaname_sidebar";

export const isSidebarCollapsed = (value: string | undefined) =>
  value === "collapsed";

export function saveSidebarCollapsed(collapsed: boolean) {
  document.cookie = `${SIDEBAR_COOKIE}=${collapsed ? "collapsed" : "expanded"}; path=/; max-age=31536000; samesite=lax`;
}
