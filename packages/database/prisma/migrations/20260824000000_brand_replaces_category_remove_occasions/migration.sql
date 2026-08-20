-- Preserve category IDs and data while renaming the catalog concept to Brand.
ALTER TABLE "Product" DROP CONSTRAINT "Product_categoryId_fkey";
ALTER TABLE "Category" DROP CONSTRAINT "Category_parentId_fkey";
-- Men/Women are storefront organization backed by Product.gender, not brands.
WITH RECURSIVE "StorefrontCategory" AS (
  SELECT "id" FROM "Category" WHERE "slug" IN ('men', 'women')
  UNION ALL
  SELECT child."id" FROM "Category" child
  JOIN "StorefrontCategory" parent ON child."parentId" = parent."id"
)
UPDATE "Product" SET "categoryId" = NULL
WHERE "categoryId" IN (SELECT "id" FROM "StorefrontCategory");
WITH RECURSIVE "StorefrontCategory" AS (
  SELECT "id" FROM "Category" WHERE "slug" IN ('men', 'women')
  UNION ALL
  SELECT child."id" FROM "Category" child
  JOIN "StorefrontCategory" parent ON child."parentId" = parent."id"
)
DELETE FROM "Category" WHERE "id" IN (SELECT "id" FROM "StorefrontCategory");
DROP INDEX "Category_parentId_idx";
ALTER TABLE "Category" DROP COLUMN "parentId";
ALTER TABLE "Category" RENAME TO "Brand";
ALTER INDEX "Category_pkey" RENAME TO "Brand_pkey";
ALTER INDEX "Category_slug_key" RENAME TO "Brand_slug_key";

ALTER TABLE "Product" RENAME COLUMN "categoryId" TO "brandId";
DROP INDEX "Product_categoryId_isActive_idx";
CREATE INDEX "Product_brandId_isActive_idx" ON "Product"("brandId", "isActive");
ALTER TABLE "Product" ADD CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

DROP TABLE "_OccasionToProduct";
DROP TABLE "Occasion";
