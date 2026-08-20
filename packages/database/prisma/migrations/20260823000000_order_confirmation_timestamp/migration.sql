ALTER TABLE "Order" ADD COLUMN "confirmedAt" TIMESTAMP(3);

UPDATE "Order"
SET "confirmedAt" = "updatedAt"
WHERE "status" IN ('CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED');
