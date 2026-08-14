import { z } from 'zod';

export const orderStatusSchema = z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']);
export const paymentStatusSchema = z.enum(['UNPAID', 'PAID', 'FAILED', 'REFUNDED']);
export const paymentMethodSchema = z.literal('CASH_ON_DELIVERY');
export const shippingMethodCodeSchema = z.literal('STANDARD');
export const checkoutContactSchema = z.object({ name: z.string().trim().min(2).max(200), email: z.string().trim().email().max(320), phone: z.string().trim().min(7).max(30) });
export const checkoutAddressSchema = z.object({ recipientName: z.string().trim().min(2).max(200), phone: z.string().trim().min(7).max(30), addressLine: z.string().trim().min(3).max(500), area: z.string().trim().min(1).max(200).nullable().optional(), cityDistrict: z.string().trim().min(2).max(200), postalCode: z.string().trim().min(1).max(20).nullable().optional(), country: z.string().trim().length(2).toUpperCase().default('BD') });
export const checkoutSchema = z.object({
  contact: checkoutContactSchema, savedAddressId: z.string().cuid().optional(), shippingAddress: checkoutAddressSchema.optional(),
  shippingMethod: shippingMethodCodeSchema.default('STANDARD'), paymentMethod: paymentMethodSchema.default('CASH_ON_DELIVERY'),
}).refine((value) => Boolean(value.savedAddressId) !== Boolean(value.shippingAddress), { message: 'Provide either savedAddressId or shippingAddress' });

export const shippingMethodSchema = z.object({ code: shippingMethodCodeSchema, name: z.string(), amount: z.number().nonnegative(), currency: z.literal('BDT') });
export const orderItemSchema = z.object({ id: z.string(), productId: z.string().nullable(), variantId: z.string().nullable(), productName: z.string(), productSlug: z.string(), sku: z.string(), colorName: z.string(), sizeEu: z.number().nullable(), sizeUk: z.number().nullable(), sizeUs: z.number().nullable(), unitPrice: z.number().nonnegative(), quantity: z.number().int().positive(), lineSubtotal: z.number().nonnegative() });
export const orderSummarySchema = z.object({ orderNumber: z.string(), status: orderStatusSchema, paymentStatus: paymentStatusSchema, paymentMethod: paymentMethodSchema, currency: z.literal('BDT'), subtotal: z.number().nonnegative(), shippingAmount: z.number().nonnegative(), total: z.number().nonnegative(), createdAt: z.string() });
export const orderDetailSchema = orderSummarySchema.extend({ contact: checkoutContactSchema, shippingAddress: checkoutAddressSchema, shippingMethod: z.object({ code: z.string(), name: z.string() }), items: z.array(orderItemSchema) });
export const orderConfirmationSchema = orderDetailSchema.extend({ guestLookupToken: z.string().optional() });
export const orderHistorySchema = z.object({ data: z.array(orderSummarySchema) });
export const guestOrderLookupSchema = z.object({ orderNumber: z.string().trim().min(1), token: z.string().trim().min(32) });

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CheckoutAddress = z.infer<typeof checkoutAddressSchema>;
export type ShippingMethod = z.infer<typeof shippingMethodSchema>;
export type OrderSummary = z.infer<typeof orderSummarySchema>;
export type OrderDetail = z.infer<typeof orderDetailSchema>;
export type OrderConfirmation = z.infer<typeof orderConfirmationSchema>;
export type GuestOrderLookupInput = z.infer<typeof guestOrderLookupSchema>;
