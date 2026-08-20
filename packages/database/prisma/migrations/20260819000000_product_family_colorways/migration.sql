-- Add the family/colorway structure without interpreting legacy product names.
CREATE TABLE "ProductFamily" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProductFamily_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProductFamily_slug_key" ON "ProductFamily"("slug");
CREATE INDEX "ProductFamily_name_idx" ON "ProductFamily"("name");

ALTER TABLE "Product" ADD COLUMN "familyId" TEXT;
ALTER TABLE "Product" ADD COLUMN "colorId" TEXT;

-- Every existing Product receives a family based on its existing identity.
INSERT INTO "ProductFamily" ("id", "name", "slug", "createdAt", "updatedAt")
SELECT p."id", p."title", p."slug", p."createdAt", p."updatedAt"
FROM "Product" p;

UPDATE "Product" p
SET "familyId" = p."id";

-- Keep the first real variant color on the existing Product.
WITH ranked AS (
  SELECT DISTINCT ON (v."productId") v."productId", v."colorId"
  FROM "ProductVariant" v
  ORDER BY v."productId", v."createdAt", v."id"
)
UPDATE "Product" p SET "colorId" = ranked."colorId"
FROM ranked WHERE ranked."productId" = p."id";

-- A legacy product with no variants still needs a stable compatibility color.
INSERT INTO "Color" ("id", "name", "slug", "isActive", "createdAt", "updatedAt")
VALUES ('legacy-unspecified-color', 'Unspecified', 'unspecified', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;

UPDATE "Product" SET "colorId" = (SELECT "id" FROM "Color" WHERE "slug" = 'unspecified')
WHERE "colorId" IS NULL;

-- Split every additional real color into an independent Product. UUID text is a
-- valid Prisma String id; relationships are derived from variant colorId only.
INSERT INTO "Product" (
  "id", "title", "slug", "familyId", "colorId", "description", "basePrice",
  "categoryId", "gender", "material", "soleType", "heelType", "isActive",
  "publishedAt", "createdAt", "updatedAt"
)
SELECT
  gen_random_uuid()::text,
  p."title" || ' | ' || c."name",
  p."slug" || '-' || c."slug",
  p."familyId", c."id", p."description", p."basePrice", p."categoryId",
  p."gender", p."material", p."soleType", p."heelType", p."isActive",
  p."publishedAt", p."createdAt", p."updatedAt"
FROM "Product" p
JOIN (SELECT DISTINCT "productId", "colorId" FROM "ProductVariant") vc ON vc."productId" = p."id"
JOIN "Color" c ON c."id" = vc."colorId"
WHERE vc."colorId" <> p."colorId";

-- Copy many-to-many occasions to split colorway products.
INSERT INTO "_OccasionToProduct" ("A", "B")
SELECT op."A", sibling."id"
FROM "_OccasionToProduct" op
JOIN "Product" original ON original."id" = op."B"
JOIN "Product" sibling ON sibling."familyId" = original."familyId"
  AND sibling."id" <> original."id"
ON CONFLICT DO NOTHING;

-- Move size variants and color-scoped media to their new Product owner.
UPDATE "ProductVariant" v SET "productId" = sibling."id"
FROM "Product" original
JOIN "Product" sibling ON sibling."familyId" = original."familyId"
  AND sibling."colorId" <> original."colorId"
WHERE v."productId" = original."id" AND v."colorId" = sibling."colorId";

UPDATE "ProductMedia" m SET "productId" = sibling."id"
FROM "Product" original
JOIN "Product" sibling ON sibling."familyId" = original."familyId"
  AND sibling."colorId" <> original."colorId"
WHERE m."productId" = original."id" AND m."colorId" = sibling."colorId";

-- Normalize every generated display name from the real family/color relations.
UPDATE "Product" p SET "title" = f."name" || ' | ' || c."name"
FROM "ProductFamily" f, "Color" c
WHERE p."familyId" = f."id" AND p."colorId" = c."id";

ALTER TABLE "Product" ALTER COLUMN "familyId" SET NOT NULL;
ALTER TABLE "Product" ALTER COLUMN "colorId" SET NOT NULL;
ALTER TABLE "Product" ADD CONSTRAINT "Product_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "ProductFamily"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Product" ADD CONSTRAINT "Product_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE UNIQUE INDEX "Product_familyId_colorId_key" ON "Product"("familyId", "colorId");
CREATE INDEX "Product_familyId_isActive_idx" ON "Product"("familyId", "isActive");
