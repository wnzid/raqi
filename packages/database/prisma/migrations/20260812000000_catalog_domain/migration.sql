CREATE TYPE "MediaPosition" AS ENUM ('TOP', 'SIDE', 'BACK', 'SOLE', 'ON_FOOT', 'OTHER');

ALTER TABLE "Category" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Color" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Product" DROP COLUMN "occasion";
ALTER TABLE "ProductMedia" ADD COLUMN "mediaPosition" "MediaPosition", ADD COLUMN "isPrimary" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "Occasion" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Occasion_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Occasion_slug_key" ON "Occasion"("slug");

CREATE TABLE "_OccasionToProduct" (
  "A" TEXT NOT NULL,
  "B" TEXT NOT NULL
);
CREATE UNIQUE INDEX "_OccasionToProduct_AB_unique" ON "_OccasionToProduct"("A", "B");
CREATE INDEX "_OccasionToProduct_B_index" ON "_OccasionToProduct"("B");
ALTER TABLE "_OccasionToProduct" ADD CONSTRAINT "_OccasionToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "Occasion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_OccasionToProduct" ADD CONSTRAINT "_OccasionToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_stockQuantity_nonnegative" CHECK ("stockQuantity" >= 0);
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_priceOverride_nonnegative" CHECK ("priceOverride" IS NULL OR "priceOverride" >= 0);
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_weightGrams_positive" CHECK ("weightGrams" IS NULL OR "weightGrams" > 0);
ALTER TABLE "Product" ADD CONSTRAINT "Product_basePrice_nonnegative" CHECK ("basePrice" >= 0);
