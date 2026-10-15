// Espacios de la cuenta de Lucas para las stories (pantalla home de Stitch). El color es solo
// identidad: los gráficos de cada espacio siguen con --chart-1 y --chart-2.
export type StoryWorkspace = {
  id: string;
  name: string;
  initials: string;
  type: "BUSINESS" | "PROJECTS";
  color: string | null;
  pending: number;
};

export const workspaces: StoryWorkspace[] = [
  {
    id: "tank-vault",
    name: "Tank Vault TCG",
    initials: "TV",
    type: "BUSINESS",
    color: "#3d6bd1",
    pending: 3,
  },
  {
    id: "disanza",
    name: "Disanza",
    initials: "DZ",
    type: "BUSINESS",
    color: "#e07a3f",
    pending: 5,
  },
  {
    id: "visio",
    name: "VISIÓ",
    initials: "VS",
    type: "BUSINESS",
    color: "#2a9d8f",
    pending: 2,
  },
  {
    id: "shinka",
    name: "Shinka",
    initials: "SK",
    type: "PROJECTS",
    color: "#c94f7c",
    pending: 1,
  },
];

// Próximos eventos del launcher: el título sale de los textos (shell.events) por índice.
export const upcomingEvents = [
  { workspaceId: "shinka", at: "2026-10-16T13:30:00Z" },
  { workspaceId: "disanza", at: "2026-10-17T22:00:00Z" },
  { workspaceId: "tank-vault", at: "2026-10-19T18:00:00Z" },
  { workspaceId: "visio", at: "2026-10-20T14:00:00Z" },
];
