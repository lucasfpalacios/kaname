import { Module } from "@nestjs/common";
import { CategoriesController } from "./categories.controller.js";
import { CategoriesService } from "./categories.service.js";
import { ProductsController } from "./products.controller.js";
import { ProductsService } from "./products.service.js";
import { VariantsController } from "./variants.controller.js";

// Catálogo (Fase 3): categorías, productos, variantes y stock.
@Module({
  controllers: [CategoriesController, ProductsController, VariantsController],
  providers: [CategoriesService, ProductsService],
})
export class CatalogModule {}
