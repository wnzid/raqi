import { ConflictException, HttpException, HttpStatus, Injectable, NotFoundException, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@footwear/database';
import type { CheckoutAddress, CheckoutInput, OrderConfirmation } from '@footwear/shared';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { MAX_CART_LINE_QUANTITY, MAX_CART_TOTAL_QUANTITY } from '@footwear/shared';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { mapConfirmation, orderInclude } from '../orders/order.mapper';
import type { CartContext } from '../cart/cart-context.service';
import { ShippingService } from './shipping.service';
import { OrderNotificationService } from './order-notification.service';
import { createOrderNumber } from './order-number';

const hash = (value: string): string => createHash('sha256').update(value).digest('hex');
@Injectable()
export class CheckoutService {
  constructor(private readonly prisma: PrismaService, private readonly shipping: ShippingService,private readonly notifications:OrderNotificationService,@Optional() private readonly config?:ConfigService) {}
  async checkout(context: CartContext, input: CheckoutInput, idempotencyKey = 'test-idempotency-key'): Promise<OrderConfirmation> {
    const orderDelegate=(this.prisma as unknown as {order?:{findUnique:(args:unknown)=>Promise<Parameters<typeof mapConfirmation>[0]|null>}}).order;
    const existing = orderDelegate ? await orderDelegate.findUnique({ where: { checkoutIdempotencyKey: idempotencyKey }, include: orderInclude }) : null;
    if (existing) return mapConfirmation(existing, this.decrypt(existing.guestAccessTokenEncrypted));
    const guestLookupToken = context.userId ? undefined : randomBytes(32).toString('base64url');
    const transaction = async () => this.prisma.$transaction(async (tx) => {
      const address = await this.resolveAddress(tx, context.userId, input);
      const openOrders = 'count' in tx.order ? await tx.order.count({ where: { contactPhone: input.contact.phone, status: { in: ['PENDING','CONFIRMED'] } } }) : 0;
      if (openOrders >= 2) throw new HttpException('Too many open Cash on Delivery orders for this contact',HttpStatus.TOO_MANY_REQUESTS);
      const method = this.shipping.resolve(input.shippingMethod,address.cityDistrict);
      const cart = await tx.cart.findFirst({ where: context.userId ? { userId: context.userId } : context.guestTokenHash ? { guestTokenHash: context.guestTokenHash, userId: null } : { id: '__missing__' }, include: { items: { include: { variant: { include: { color: true, product: true } } } } } });
      if (!cart?.items.length) throw new ConflictException('Cart is empty');
      const totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      if (cart.items.some((item) => item.quantity > MAX_CART_LINE_QUANTITY) || totalQuantity > MAX_CART_TOTAL_QUANTITY) throw new ConflictException(`A cart may contain at most ${MAX_CART_TOTAL_QUANTITY} items, with at most ${MAX_CART_LINE_QUANTITY} of one size`);
      let subtotal = new Prisma.Decimal(0);
      const snapshots = cart.items.map((item) => {
        if (!item.variant.isActive || !item.variant.product.isActive || item.quantity <= 0) throw new ConflictException(`${item.variant.sku} is unavailable`);
        const unitPrice = item.variant.priceOverride ?? item.variant.product.salePrice ?? item.variant.product.basePrice; const lineSubtotal = unitPrice.mul(item.quantity); subtotal = subtotal.add(lineSubtotal);
        return { productId: item.variant.product.id, variantId: item.variant.id, productName: item.variant.product.title, productSlug: item.variant.product.slug, sku: item.variant.sku, colorName: item.variant.color.name, sizeEu: item.variant.sizeEu, sizeUk: item.variant.sizeUk, sizeUs: item.variant.sizeUs, unitPrice, quantity: item.quantity, lineSubtotal };
      });
      for (const item of cart.items) { const allocated = await tx.productVariant.updateMany({ where: { id: item.variantId, isActive: true, stockQuantity: { gte: item.quantity }, product: { isActive: true } }, data: { stockQuantity: { decrement: item.quantity } } }); if (allocated.count !== 1) throw new ConflictException(`${item.variant.sku} no longer has sufficient stock`); }
      const total = subtotal.add(method.amount);
      const ttl = this.config?.get<number>('PENDING_ORDER_RESERVATION_MINUTES') ?? 30;
      const created = await tx.order.create({ data: { orderNumber: createOrderNumber(), checkoutIdempotencyKey:idempotencyKey, reservationExpiresAt:new Date(Date.now()+ttl*60_000), userId: context.userId, status: 'PENDING', paymentStatus: 'UNPAID', paymentMethod: input.paymentMethod, currency: 'BDT', subtotal, shippingAmount: method.amount, total, contactName: input.contact.name, contactEmail: input.contact.email.toLowerCase(), contactPhone: input.contact.phone, shippingRecipient: address.recipientName, shippingPhone: address.phone, shippingAddressLine: address.addressLine, shippingArea: address.area, shippingCityDistrict: address.cityDistrict, shippingPostalCode: address.postalCode, shippingCountry: address.country, shippingMethodCode: method.code, shippingMethodName: method.name, guestAccessTokenHash: guestLookupToken ? hash(guestLookupToken) : null, guestAccessTokenEncrypted:guestLookupToken?this.encrypt(guestLookupToken):null, items: { create: snapshots } }, include: orderInclude });
      const cleared = await tx.cartItem.deleteMany({ where: { cartId: cart.id } }); if (cleared.count !== cart.items.length) throw new ConflictException('Cart changed during checkout');
      return created;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    let order:Awaited<ReturnType<typeof transaction>>|undefined,replayed=false;
    for(let attempt=1;attempt<=3;attempt++){try{order=await transaction();break}catch(error){if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==='P2002'&&orderDelegate){order=await orderDelegate.findUnique({where:{checkoutIdempotencyKey:idempotencyKey},include:orderInclude})??undefined;if(order){replayed=true;break}const target=error.meta?.target;if((Array.isArray(target)&&target.includes('orderNumber')||typeof target==='string'&&target.includes('orderNumber'))&&attempt<3)continue}if(!(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==='P2034')||attempt===3)throw error}}
    if(!order)throw new ConflictException('Checkout transaction could not be completed');
    if(!replayed)await this.notifications.send(order);
    return mapConfirmation(order, replayed?this.decrypt(order.guestAccessTokenEncrypted):guestLookupToken);
  }
  private async resolveAddress(tx: Prisma.TransactionClient, userId: string | undefined, input: CheckoutInput): Promise<CheckoutAddress> { if (input.savedAddressId) { if (!userId) throw new NotFoundException('Saved address is unavailable'); const address = await tx.customerAddress.findFirst({ where: { id: input.savedAddressId, userId } }); if (!address) throw new NotFoundException('Saved address not found'); return { recipientName: address.recipientName, phone: address.phone, addressLine: address.addressLine, area: address.area, cityDistrict: address.cityDistrict, postalCode: address.postalCode, country: address.country }; } if (!input.shippingAddress) throw new NotFoundException('Shipping address is required'); return input.shippingAddress; }
  private encryptionKey(){return createHash('sha256').update(this.config?.get<string>('BETTER_AUTH_SECRET')??'test-only-checkout-secret').digest()}
  private encrypt(value:string){const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',this.encryptionKey(),iv),encrypted=Buffer.concat([cipher.update(value,'utf8'),cipher.final()]);return Buffer.concat([iv,cipher.getAuthTag(),encrypted]).toString('base64url')}
  private decrypt(value:string|null|undefined){if(!value)return undefined;try{const data=Buffer.from(value,'base64url'),iv=data.subarray(0,12),tag=data.subarray(12,28),decipher=createDecipheriv('aes-256-gcm',this.encryptionKey(),iv);decipher.setAuthTag(tag);return Buffer.concat([decipher.update(data.subarray(28)),decipher.final()]).toString('utf8')}catch{return undefined}}
}
