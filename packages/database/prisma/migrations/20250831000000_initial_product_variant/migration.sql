CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TYPE "Gender" AS ENUM ('WOMEN', 'MEN', 'UNISEX', 'KIDS');
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');

CREATE TABLE "Category" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "slug" TEXT NOT NULL, "parentId" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Category_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Product" ("id" TEXT NOT NULL, "title" TEXT NOT NULL, "slug" TEXT NOT NULL, "description" TEXT NOT NULL, "basePrice" DECIMAL(12,2) NOT NULL, "categoryId" TEXT, "gender" "Gender", "material" TEXT, "soleType" TEXT, "heelType" TEXT, "occasion" TEXT, "isActive" BOOLEAN NOT NULL DEFAULT false, "publishedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Product_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Color" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "slug" TEXT NOT NULL, "hex" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Color_pkey" PRIMARY KEY ("id"));
CREATE TABLE "ProductVariant" ("id" TEXT NOT NULL, "productId" TEXT NOT NULL, "sku" TEXT NOT NULL, "colorId" TEXT NOT NULL, "sizeEu" DECIMAL(4,1), "sizeUk" DECIMAL(4,1), "sizeUs" DECIMAL(4,1), "stockQuantity" INTEGER NOT NULL DEFAULT 0, "priceOverride" DECIMAL(12,2), "weightGrams" INTEGER, "isActive" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id"));
CREATE TABLE "ProductMedia" ("id" TEXT NOT NULL, "productId" TEXT NOT NULL, "variantId" TEXT, "type" "MediaType" NOT NULL DEFAULT 'IMAGE', "objectKey" TEXT NOT NULL, "altText" TEXT, "position" INTEGER NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "ProductMedia_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
CREATE INDEX "Product_categoryId_isActive_idx" ON "Product"("categoryId", "isActive");
CREATE INDEX "Product_title_idx" ON "Product"("title");
CREATE UNIQUE INDEX "Color_slug_key" ON "Color"("slug");
CREATE UNIQUE INDEX "ProductVariant_sku_key" ON "ProductVariant"("sku");
CREATE UNIQUE INDEX "ProductVariant_productId_colorId_sizeEu_sizeUk_sizeUs_key" ON "ProductVariant"("productId", "colorId", "sizeEu", "sizeUk", "sizeUs");
CREATE INDEX "ProductVariant_productId_isActive_idx" ON "ProductVariant"("productId", "isActive");
CREATE INDEX "ProductVariant_colorId_idx" ON "ProductVariant"("colorId");
CREATE INDEX "ProductVariant_stockQuantity_idx" ON "ProductVariant"("stockQuantity");
CREATE INDEX "ProductMedia_productId_position_idx" ON "ProductMedia"("productId", "position");
CREATE INDEX "ProductMedia_variantId_position_idx" ON "ProductMedia"("variantId", "position");
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProductMedia" ADD CONSTRAINT "ProductMedia_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductMedia" ADD CONSTRAINT "ProductMedia_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
