DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "ProductVariant"
    WHERE "sizeEu" IS NOT NULL
    GROUP BY "productId", "colorId", "sizeEu" HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Duplicate EU-size variants exist; resolve them before applying this migration';
  END IF;
END $$;

ALTER TABLE "ProductVariant" DROP CONSTRAINT IF EXISTS "ProductVariant_productId_colorId_sizeEu_sizeUk_sizeUs_key";
CREATE UNIQUE INDEX "ProductVariant_productId_colorId_sizeEu_key" ON "ProductVariant"("productId", "colorId", "sizeEu");

ALTER TABLE "Order"
  ADD COLUMN "guestAccessTokenEncrypted" TEXT,
  ADD COLUMN "checkoutIdempotencyKey" TEXT,
  ADD COLUMN "reservationExpiresAt" TIMESTAMP(3);

UPDATE "Order" SET "checkoutIdempotencyKey" = 'legacy:' || "id" WHERE "checkoutIdempotencyKey" IS NULL;
ALTER TABLE "Order" ALTER COLUMN "checkoutIdempotencyKey" SET NOT NULL;
CREATE UNIQUE INDEX "Order_checkoutIdempotencyKey_key" ON "Order"("checkoutIdempotencyKey");
CREATE INDEX "Order_contactPhone_status_idx" ON "Order"("contactPhone", "status");
CREATE INDEX "Order_status_reservationExpiresAt_idx" ON "Order"("status", "reservationExpiresAt");

ALTER TABLE "Product" ADD CONSTRAINT "Product_prices_positive_and_ordered_check"
  CHECK ("basePrice" > 0 AND ("salePrice" IS NULL OR ("salePrice" > 0 AND "salePrice" < "basePrice")));
