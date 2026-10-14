-- Revisión de la Fase 0.

-- 1. Roles del sistema identificados por clave (la UI traduce el nombre), en lugar de isSystem.
CREATE TYPE "SystemRoleKey" AS ENUM ('OWNER', 'COLLABORATOR', 'CLIENT');

ALTER TABLE "Role" ADD COLUMN "systemKey" "SystemRoleKey";

-- Los roles del sistema ya sembrados conservan su identidad.
UPDATE "Role" SET "systemKey" = 'OWNER' WHERE "isSystem" AND "name" = 'Dueño';
UPDATE "Role" SET "systemKey" = 'COLLABORATOR' WHERE "isSystem" AND "name" = 'Colaborador';
UPDATE "Role" SET "systemKey" = 'CLIENT' WHERE "isSystem" AND "name" = 'Cliente';

ALTER TABLE "Role" DROP COLUMN "isSystem";

CREATE UNIQUE INDEX "Role_accountId_systemKey_key" ON "Role"("accountId", "systemKey");

-- 2. ProductVariant con workspaceId propio (se consulta directo por stock y precios).
-- La tabla todavía no tiene filas, así que la columna puede ser NOT NULL sin valor por defecto.
ALTER TABLE "ProductVariant" ADD COLUMN "workspaceId" TEXT NOT NULL;

CREATE INDEX "ProductVariant_workspaceId_idx" ON "ProductVariant"("workspaceId");

ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 3. Categorías: dos categorías raíz (parentId NULL) con el mismo nombre en el mismo espacio
-- tienen que chocar. Prisma no modela NULLS NOT DISTINCT, así que se recrea el índice a mano.
DROP INDEX "Category_workspaceId_name_parentId_key";

CREATE UNIQUE INDEX "Category_workspaceId_name_parentId_key" ON "Category"("workspaceId", "name", "parentId") NULLS NOT DISTINCT;
