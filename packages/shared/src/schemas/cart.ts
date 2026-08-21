import { z } from 'zod';
import { MAX_CART_LINE_QUANTITY } from '../constants/commerce';

export const cartQuantitySchema = z.coerce.number().int().positive().max(MAX_CART_LINE_QUANTITY, `A cart line may contain at most ${MAX_CART_LINE_QUANTITY} items`);
export const addCartItemSchema = z.object({ variantId: z.string().cuid(), quantity: cartQuantitySchema.default(1) });
export const updateCartItemSchema = z.object({ quantity: cartQuantitySchema });
export const cartItemSchema = z.object({
  id: z.string(), variantId: z.string(), sku: z.string(), productId: z.string(), productName: z.string(), productSlug: z.string(),
  color: z.object({ name: z.string(), slug: z.string(), hex: z.string().nullable() }), sizeEu: z.number().nullable(), sizeUk: z.number().nullable(), sizeUs: z.number().nullable(),
  thumbnail: z.string().nullable(), quantity: z.number().int().positive(), availableStock: z.number().int().nonnegative(), isAvailable: z.boolean(), regularPrice: z.number().nonnegative(), unitPrice: z.number().nonnegative(), lineSubtotal: z.number().nonnegative(),
});
export const cartSchema = z.object({ items: z.array(cartItemSchema), subtotal: z.number().nonnegative(), totalQuantity: z.number().int().nonnegative() });

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;
export type ShoppingCart = z.infer<typeof cartSchema>;
