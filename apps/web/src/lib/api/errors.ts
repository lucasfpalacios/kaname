// Errores de la API: { message: "<código>", issues?: [{ path, code }] }. Los códigos se traducen
// con Errors.<código> (messages/*.json).
export type ApiError = {
  code: string;
  issues: { path: string; code: string }[];
};

export async function readApiError(response: Response): Promise<ApiError> {
  try {
    const body = (await response.json()) as {
      message?: unknown;
      issues?: { path: string; code: string }[];
    };
    return {
      code: typeof body.message === "string" ? body.message : "unknown",
      issues: Array.isArray(body.issues) ? body.issues : [],
    };
  } catch {
    return { code: "unknown", issues: [] };
  }
}
