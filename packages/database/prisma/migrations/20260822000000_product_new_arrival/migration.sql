ALTER TABLE "Product" ADD COLUMN "isNewArrival" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "Product_isNewArrival_isActive_idx" ON "Product"("isNewArrival", "isActive");
