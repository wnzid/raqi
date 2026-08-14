import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@footwear/database';
import type { CheckoutAddress, CheckoutInput, OrderConfirmation } from '@footwear/shared';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { mapConfirmation, orderInclude } from '../orders/order.mapper';
import type { CartContext } from '../cart/cart-context.service';
import { ShippingService } from './shipping.service';

const hash = (value: string): string => createHash('sha256').update(value).digest('hex');
@Injectable()
export class CheckoutService {
  constructor(private readonly prisma: PrismaService, private readonly shipping: ShippingService) {}
  async checkout(context: CartContext, input: CheckoutInput): Promise<OrderConfirmation> {
    const method = this.shipping.resolve(input.shippingMethod);
    const guestLookupToken = context.userId ? undefined : randomBytes(32).toString('base64url');
    const order = await this.prisma.$transaction(async (tx) => {
      const address = await this.resolveAddress(tx, context.userId, input);
      const cart = await tx.cart.findFirst({ where: context.userId ? { userId: context.userId } : context.guestTokenHash ? { guestTokenHash: context.guestTokenHash, userId: null } : { id: '__missing__' }, include: { items: { include: { variant: { include: { color: true, product: true } } } } } });
      if (!cart?.items.length) throw new ConflictException('Cart is empty');
      let subtotal = new Prisma.Decimal(0);
      const snapshots = cart.items.map((item) => {
        if (!item.variant.isActive || !item.variant.product.isActive || item.quantity <= 0) throw new ConflictException(`${item.variant.sku} is unavailable`);
        const unitPrice = item.variant.priceOverride ?? item.variant.product.basePrice; const lineSubtotal = unitPrice.mul(item.quantity); subtotal = subtotal.add(lineSubtotal);
        return { productId: item.variant.product.id, variantId: item.variant.id, productName: item.variant.product.title, productSlug: item.variant.product.slug, sku: item.variant.sku, colorName: item.variant.color.name, sizeEu: item.variant.sizeEu, sizeUk: item.variant.sizeUk, sizeUs: item.variant.sizeUs, unitPrice, quantity: item.quantity, lineSubtotal };
      });
      for (const item of cart.items) { const allocated = await tx.productVariant.updateMany({ where: { id: item.variantId, isActive: true, stockQuantity: { gte: item.quantity }, product: { isActive: true } }, data: { stockQuantity: { decrement: item.quantity } } }); if (allocated.count !== 1) throw new ConflictException(`${item.variant.sku} no longer has sufficient stock`); }
      const total = subtotal.add(method.amount);
      const created = await tx.order.create({ data: { orderNumber: this.orderNumber(), userId: context.userId, status: 'PENDING', paymentStatus: 'UNPAID', paymentMethod: input.paymentMethod, currency: 'BDT', subtotal, shippingAmount: method.amount, total, contactName: input.contact.name, contactEmail: input.contact.email.toLowerCase(), contactPhone: input.contact.phone, shippingRecipient: address.recipientName, shippingPhone: address.phone, shippingAddressLine: address.addressLine, shippingArea: address.area, shippingCityDistrict: address.cityDistrict, shippingPostalCode: address.postalCode, shippingCountry: address.country, shippingMethodCode: method.code, shippingMethodName: method.name, guestAccessTokenHash: guestLookupToken ? hash(guestLookupToken) : null, items: { create: snapshots } }, include: orderInclude });
      const cleared = await tx.cartItem.deleteMany({ where: { cartId: cart.id } }); if (cleared.count !== cart.items.length) throw new ConflictException('Cart changed during checkout');
      return created;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return mapConfirmation(order, guestLookupToken);
  }
  private async resolveAddress(tx: Prisma.TransactionClient, userId: string | undefined, input: CheckoutInput): Promise<CheckoutAddress> { if (input.savedAddressId) { if (!userId) throw new NotFoundException('Saved address is unavailable'); const address = await tx.customerAddress.findFirst({ where: { id: input.savedAddressId, userId } }); if (!address) throw new NotFoundException('Saved address not found'); return { recipientName: address.recipientName, phone: address.phone, addressLine: address.addressLine, area: address.area, cityDistrict: address.cityDistrict, postalCode: address.postalCode, country: address.country }; } if (!input.shippingAddress) throw new NotFoundException('Shipping address is required'); return input.shippingAddress; }
  private orderNumber(): string { const day = new Date().toISOString().slice(0, 10).replaceAll('-', ''); return `RAQI-${day}-${randomBytes(4).toString('hex').toUpperCase()}`; }
}
