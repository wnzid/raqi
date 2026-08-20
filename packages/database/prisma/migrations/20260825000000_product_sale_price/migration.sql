ALTER TABLE "Product" ADD COLUMN "salePrice" DECIMAL(12,2);

ALTER TABLE "Product" ADD CONSTRAINT "Product_salePrice_valid"
CHECK ("salePrice" IS NULL OR ("salePrice" > 0 AND "salePrice" < "basePrice"));
