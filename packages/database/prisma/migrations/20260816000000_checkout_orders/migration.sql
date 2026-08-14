CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PAID', 'FAILED', 'REFUNDED');
CREATE TYPE "PaymentMethod" AS ENUM ('CASH_ON_DELIVERY');

CREATE TABLE "Order" (
  "id" TEXT NOT NULL, "orderNumber" TEXT NOT NULL, "userId" TEXT,
  "status" "OrderStatus" NOT NULL DEFAULT 'PENDING', "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
  "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CASH_ON_DELIVERY', "currency" TEXT NOT NULL DEFAULT 'BDT',
  "subtotal" DECIMAL(12,2) NOT NULL, "shippingAmount" DECIMAL(12,2) NOT NULL, "total" DECIMAL(12,2) NOT NULL,
  "contactName" TEXT NOT NULL, "contactEmail" TEXT NOT NULL, "contactPhone" TEXT NOT NULL,
  "shippingRecipient" TEXT NOT NULL, "shippingPhone" TEXT NOT NULL, "shippingAddressLine" TEXT NOT NULL,
  "shippingArea" TEXT, "shippingCityDistrict" TEXT NOT NULL, "shippingPostalCode" TEXT, "shippingCountry" TEXT NOT NULL,
  "shippingMethodCode" TEXT NOT NULL, "shippingMethodName" TEXT NOT NULL, "guestAccessTokenHash" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
CREATE UNIQUE INDEX "Order_guestAccessTokenHash_key" ON "Order"("guestAccessTokenHash");
CREATE INDEX "Order_userId_createdAt_idx" ON "Order"("userId", "createdAt");
CREATE INDEX "Order_contactEmail_idx" ON "Order"("contactEmail");

CREATE TABLE "OrderItem" (
  "id" TEXT NOT NULL, "orderId" TEXT NOT NULL, "productId" TEXT, "variantId" TEXT,
  "productName" TEXT NOT NULL, "productSlug" TEXT NOT NULL, "sku" TEXT NOT NULL, "colorName" TEXT NOT NULL,
  "sizeEu" DECIMAL(4,1), "sizeUk" DECIMAL(4,1), "sizeUs" DECIMAL(4,1),
  "unitPrice" DECIMAL(12,2) NOT NULL, "quantity" INTEGER NOT NULL, "lineSubtotal" DECIMAL(12,2) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "OrderItem_quantity_positive" CHECK ("quantity" > 0)
);
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX "OrderItem_variantId_idx" ON "OrderItem"("variantId");
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
