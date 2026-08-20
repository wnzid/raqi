ALTER TABLE "ProductMedia" ADD COLUMN "colorId" TEXT;
ALTER TABLE "ProductMedia" ADD CONSTRAINT "ProductMedia_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "ProductMedia_productId_colorId_position_idx" ON "ProductMedia"("productId", "colorId", "position");
UPDATE "ProductMedia" media SET "colorId" = variant."colorId" FROM "ProductVariant" variant WHERE media."variantId" = variant."id" AND media."colorId" IS NULL;
