import type {
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
  WorkspaceSummary,
} from "@kaname/shared";
import { apiFetch } from "@/lib/api/browser";
import { type ApiError, readApiError } from "@/lib/api/errors";

// Alta, configuración y archivado de espacios desde el navegador.
type Result<T> = { ok: true; data: T } | { ok: false; error: ApiError };

async function send<T>(path: string, method: string, body?: unknown) {
  try {
    const response = await apiFetch(path, {
      method,
      headers: body ? { "content-type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
      return { ok: false, error: await readApiError(response) } as Result<T>;
    }
    const data = response.status === 204 ? undefined : await response.json();
    return { ok: true, data: data as T } as Result<T>;
  } catch {
    return { ok: false, error: { code: "unknown", issues: [] } } as Result<T>;
  }
}

export const createWorkspace = (input: CreateWorkspaceInput) =>
  send<WorkspaceSummary>("/api/workspaces", "POST", input);

export const updateWorkspace = (id: string, input: UpdateWorkspaceInput) =>
  send<WorkspaceSummary>(`/api/workspaces/${id}`, "PATCH", input);

export const archiveWorkspace = (id: string) =>
  send<void>(`/api/workspaces/${id}/archive`, "POST");
