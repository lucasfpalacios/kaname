-- Marca el ajuste con el que nace cada variante (su stock inicial): no cuenta como historial a la
-- hora de borrar un producto o una variante.
ALTER TABLE "StockMovement" ADD COLUMN "initial" BOOLEAN NOT NULL DEFAULT false;

-- Los que ya existen: el ajuste "Stock inicial" que crea la API al dar de alta una variante.
UPDATE "StockMovement" SET "initial" = true WHERE "type" = 'ADJUSTMENT' AND "note" = 'Stock inicial';
