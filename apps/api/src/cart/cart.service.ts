import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@footwear/database';
import { MAX_CART_LINE_QUANTITY, MAX_CART_TOTAL_QUANTITY, type AddCartItemInput, type ShoppingCart, type UpdateCartItemInput } from '@footwear/shared';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import type { CartContext } from './cart-context.service';
import { cartVariantSellable, mergedCartQuantity } from './cart.rules';
import { resolveMediaUrl } from '../media/media-url';
import { cartTiming } from './cart-timing';

const cartInclude = { items: { include: { variant: { include: { color: true, product: { include: { media: { orderBy: { position: 'asc' as const } } } } } } }, orderBy: { createdAt: 'asc' as const } } } satisfies Prisma.CartInclude;
type CartRecord = Prisma.CartGetPayload<{ include: typeof cartInclude }>;

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}
  async get(context: CartContext): Promise<ShoppingCart> { const cart = await this.findCart(context); return cart ? this.map(cart) : this.empty(); }

  async add(context: CartContext, input: AddCartItemInput): Promise<ShoppingCart> {
    await this.prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.findUnique({ where: { id: input.variantId }, include: { product: true, color: true } });
      this.requireSellable(variant, input.quantity);
      const cart = await this.getOrCreateCart(tx, context);
      const existing = await tx.cartItem.findUnique({ where: { cartId_variantId: { cartId: cart.id, variantId: input.variantId } } });
      const quantity = (existing?.quantity ?? 0) + input.quantity;
      if (quantity > MAX_CART_LINE_QUANTITY) throw new ConflictException(`A cart line may contain at most ${MAX_CART_LINE_QUANTITY} items`);
      this.requireStock(variant!.stockQuantity, quantity);
      const total = 'aggregate' in tx.cartItem ? await tx.cartItem.aggregate({ where: { cartId: cart.id, variantId: { not: input.variantId } }, _sum: { quantity: true } }) : { _sum: { quantity: 0 } };
      if ((total._sum.quantity ?? 0) + quantity > MAX_CART_TOTAL_QUANTITY) throw new ConflictException(`A cart may contain at most ${MAX_CART_TOTAL_QUANTITY} items`);
      await tx.cartItem.upsert({ where: { cartId_variantId: { cartId: cart.id, variantId: input.variantId } }, create: { cartId: cart.id, variantId: input.variantId, quantity }, update: { quantity } });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return this.get(context);
  }

  async update(context: CartContext, itemId: string, input: UpdateCartItemInput): Promise<ShoppingCart> {
    const findStarted=performance.now();
    const item = await this.prisma.cartItem.findFirst({ where: { id: itemId, cart: this.owner(context) }, include: { variant: { include: { product: true, color: true } } } });
    cartTiming('find item + variant',findStarted);
    if (!item) throw new NotFoundException('Cart item not found'); this.requireSellable(item.variant, input.quantity);
    const total = await this.prisma.cartItem.aggregate({ where: { cartId: item.cartId, id: { not: item.id } }, _sum: { quantity: true } });
    if ((total._sum.quantity ?? 0) + input.quantity > MAX_CART_TOTAL_QUANTITY) throw new ConflictException(`A cart may contain at most ${MAX_CART_TOTAL_QUANTITY} items`);
    const updateStarted=performance.now();await this.prisma.cartItem.update({ where: { id: item.id }, data: { quantity: input.quantity } });cartTiming('update item',updateStarted);const serializeStarted=performance.now();const cart=await this.prisma.cart.findUnique({where:{id:item.cartId},include:cartInclude});const result=cart?this.map(cart):this.empty();cartTiming('fetch + serialize cart',serializeStarted);return result;
  }
  async remove(context: CartContext, itemId: string): Promise<ShoppingCart> { const cart = await this.requireCart(context); const result = await this.prisma.cartItem.deleteMany({ where: { id: itemId, cartId: cart.id } }); if (!result.count) throw new NotFoundException('Cart item not found'); return this.get(context); }
  async clear(context: CartContext): Promise<void> { const cart = await this.findCart(context); if (cart) await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } }); }

  async merge(context: CartContext): Promise<ShoppingCart> {
    if (!context.userId) throw new ConflictException('Authentication required to merge a cart');
    if (!context.guestTokenHash) return this.get(context);
    await this.prisma.$transaction(async (tx) => {
      const guest = await tx.cart.findUnique({ where: { guestTokenHash: context.guestTokenHash }, include: { items: { include: { variant: { include: { product: true } } } } } });
      if (!guest || guest.userId) return;
      const customer = await tx.cart.findUnique({ where: { userId: context.userId } });
      if (!customer) { for (const item of guest.items) { if (!this.sellable(item.variant)) await tx.cartItem.delete({ where: { id: item.id } }); else if (item.quantity > item.variant.stockQuantity) await tx.cartItem.update({ where: { id: item.id }, data: { quantity: item.variant.stockQuantity } }); } await tx.cart.update({ where: { id: guest.id }, data: { userId: context.userId, guestTokenHash: null } }); return; }
      for (const item of guest.items) {
        if (!this.sellable(item.variant)) continue;
        const existing = await tx.cartItem.findUnique({ where: { cartId_variantId: { cartId: customer.id, variantId: item.variantId } } });
        const quantity = mergedCartQuantity(item.quantity, existing?.quantity ?? 0, item.variant.stockQuantity);
        if (quantity > 0) await tx.cartItem.upsert({ where: { cartId_variantId: { cartId: customer.id, variantId: item.variantId } }, create: { cartId: customer.id, variantId: item.variantId, quantity }, update: { quantity } });
      }
      await tx.cart.delete({ where: { id: guest.id } });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return this.get({ userId: context.userId });
  }

  private owner(context: CartContext): Prisma.CartWhereInput { if (context.userId) return { userId: context.userId }; if (context.guestTokenHash) return { guestTokenHash: context.guestTokenHash, userId: null }; return { id: '__empty__' }; }
  private async findCart(context: CartContext): Promise<CartRecord | null> { return this.prisma.cart.findFirst({ where: this.owner(context), include: cartInclude }); }
  private async requireCart(context: CartContext): Promise<CartRecord> { const cart = await this.findCart(context); if (!cart) throw new NotFoundException('Cart not found'); return cart; }
  private async getOrCreateCart(tx: Prisma.TransactionClient, context: CartContext): Promise<{ id: string }> { if (context.userId) return tx.cart.upsert({ where: { userId: context.userId }, create: { userId: context.userId }, update: {}, select: { id: true } }); if (context.guestTokenHash) return tx.cart.upsert({ where: { guestTokenHash: context.guestTokenHash }, create: { guestTokenHash: context.guestTokenHash }, update: {}, select: { id: true } }); throw new ConflictException('Cart identity unavailable'); }
  private sellable(variant: { isActive: boolean; stockQuantity: number; product: { isActive: boolean } }): boolean { return cartVariantSellable(variant.isActive, variant.product.isActive, variant.stockQuantity); }
  private requireSellable(variant: { isActive: boolean; stockQuantity: number; product: { isActive: boolean } } | null, quantity: number): void { if (!variant) throw new NotFoundException('Variant not found'); if (!this.sellable(variant)) throw new ConflictException('Variant is unavailable'); this.requireStock(variant.stockQuantity, quantity); }
  private requireStock(stock: number, quantity: number): void { if (quantity > stock) throw new ConflictException(`Only ${stock} units are currently available`); }
  private empty(): ShoppingCart { return { items: [], subtotal: 0, totalQuantity: 0 }; }
  private map(cart: CartRecord): ShoppingCart {
    let subtotal = new Prisma.Decimal(0); const items = cart.items.map((item) => { const unit = item.variant.priceOverride ?? item.variant.product.salePrice ?? item.variant.product.basePrice; const available = this.sellable(item.variant); const line = available ? unit.mul(item.quantity) : new Prisma.Decimal(0); subtotal = subtotal.add(line); const media = item.variant.product.media.find((entry) => entry.variantId === item.variantId && entry.isPrimary) ?? item.variant.product.media.find((entry) => entry.isPrimary) ?? item.variant.product.media[0]; return { id: item.id, variantId: item.variantId, sku: item.variant.sku, productId: item.variant.product.id, productName: item.variant.product.title, productSlug: item.variant.product.slug, color: { name: item.variant.color.name, slug: item.variant.color.slug, hex: item.variant.color.hex }, sizeEu: item.variant.sizeEu?.toNumber() ?? null, sizeUk: item.variant.sizeUk?.toNumber() ?? null, sizeUs: item.variant.sizeUs?.toNumber() ?? null, thumbnail: media?resolveMediaUrl(media.objectKey):null, quantity: item.quantity, availableStock: item.variant.stockQuantity, isAvailable: available && item.quantity <= item.variant.stockQuantity, regularPrice: item.variant.product.basePrice.toNumber(), unitPrice: unit.toNumber(), lineSubtotal: line.toNumber() }; });
    return { items, subtotal: subtotal.toNumber(), totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0) };
  }
}
