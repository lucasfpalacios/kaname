import type {
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
  WorkspaceSummary,
} from "@kaname/shared";
import { send } from "@/lib/api/send";

// Alta, configuración y archivado de espacios desde el navegador.
export const createWorkspace = (input: CreateWorkspaceInput) =>
  send<WorkspaceSummary>("/api/workspaces", "POST", input);

export const updateWorkspace = (id: string, input: UpdateWorkspaceInput) =>
  send<WorkspaceSummary>(`/api/workspaces/${id}`, "PATCH", input);

export const archiveWorkspace = (id: string) =>
  send<void>(`/api/workspaces/${id}/archive`, "POST");

export const restoreWorkspace = (accountId: string, workspaceId: string) =>
  send<void>(
    `/api/accounts/${accountId}/archived-workspaces/${workspaceId}/restore`,
    "POST",
  );
