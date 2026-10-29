-- SKU único por espacio. Los null no chocan entre sí (Postgres los trata como distintos), así que
-- una variante sin SKU sigue siendo válida.
CREATE UNIQUE INDEX "ProductVariant_workspaceId_sku_key" ON "ProductVariant"("workspaceId", "sku");
