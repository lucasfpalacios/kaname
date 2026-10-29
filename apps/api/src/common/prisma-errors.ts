import { Prisma } from "../generated/prisma/client.js";

/**
 * Índice único que violó un error P2002, o null si el error es otro. Con el adapter de pg viene en
 * driverAdapterError (el nombre del índice, por ejemplo "Workspace_accountId_slug_key").
 */
export function uniqueIndexOf(error: unknown): string | null {
  if (
    !(error instanceof Prisma.PrismaClientKnownRequestError) ||
    error.code !== "P2002"
  ) {
    return null;
  }
  const meta = error.meta as
    | { driverAdapterError?: { cause?: { constraint?: { index?: string } } } }
    | undefined;
  return meta?.driverAdapterError?.cause?.constraint?.index ?? "desconocido";
}
