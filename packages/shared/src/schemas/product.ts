import { z } from 'zod';

export const genderSchema = z.enum(['WOMEN', 'MEN', 'UNISEX', 'KIDS']);
export const moneySchema = z.coerce.number().finite().nonnegative();
export const sizeSchema = z.coerce.number().positive().max(99);
export const paginationSchema = z.object({ page: z.coerce.number().int().positive().default(1), pageSize: z.coerce.number().int().positive().max(100).default(24) });
export const productSortSchema = z.enum(['newest', 'price_asc', 'price_desc', 'bestsellers', 'rating']).default('newest');

export const createProductSchema = z.object({
  title: z.string().trim().min(2).max(200), slug: z.string().trim().min(2).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().min(1), basePrice: moneySchema, categoryId: z.string().cuid().nullable().optional(), gender: genderSchema.nullable().optional(),
  material: z.string().trim().min(1).max(100).nullable().optional(), soleType: z.string().trim().min(1).max(100).nullable().optional(), heelType: z.string().trim().min(1).max(100).nullable().optional(),
  occasionIds: z.array(z.string().cuid()).default([]), isActive: z.boolean().default(false), publishedAt: z.coerce.date().nullable().optional(),
});
export const updateProductSchema = createProductSchema.partial().refine((value) => Object.keys(value).length > 0, 'At least one field is required');

const variantFieldsSchema = z.object({
  sku: z.string().trim().min(1).max(100), colorId: z.string().cuid(), sizeEu: sizeSchema.nullable().optional(), sizeUk: sizeSchema.nullable().optional(), sizeUs: sizeSchema.nullable().optional(),
  stockQuantity: z.coerce.number().int().nonnegative().default(0), priceOverride: moneySchema.nullable().optional(), weightGrams: z.coerce.number().int().positive().nullable().optional(), isActive: z.boolean().default(true),
});
export const createVariantSchema = variantFieldsSchema.refine((value) => value.sizeEu != null || value.sizeUk != null || value.sizeUs != null, { message: 'At least one regional size is required' });
export const updateVariantSchema = variantFieldsSchema.partial().refine((value) => Object.keys(value).length > 0, 'At least one field is required');

export const productQuerySchema = paginationSchema.extend({
  q: z.string().trim().min(1).max(200).optional(),
  category: z.string().trim().optional(), gender: genderSchema.optional(), color: z.string().trim().optional(), sizeEu: sizeSchema.optional(), sizeUk: sizeSchema.optional(), sizeUs: sizeSchema.optional(),
  material: z.string().trim().optional(), occasion: z.string().trim().optional(), soleType: z.string().trim().optional(), minPrice: moneySchema.optional(), maxPrice: moneySchema.optional(),
  inStock: z.enum(['true', 'false']).transform((value) => value === 'true').optional(), sort: productSortSchema,
}).refine((value) => value.minPrice == null || value.maxPrice == null || value.minPrice <= value.maxPrice, { message: 'minPrice must not exceed maxPrice' });

export const catalogColorSchema = z.object({ id: z.string(), name: z.string(), slug: z.string(), hex: z.string().nullable() });
export const catalogVariantSchema = z.object({ id: z.string(), sku: z.string(), color: catalogColorSchema, sizeEu: z.number().nullable(), sizeUk: z.number().nullable(), sizeUs: z.number().nullable(), stockQuantity: z.number().int(), isAvailable: z.boolean(), priceOverride: z.number().nullable(), effectivePrice: z.number(), weightGrams: z.number().nullable(), isActive: z.boolean() });
export const productSummarySchema = z.object({ id: z.string(), title: z.string(), slug: z.string(), description: z.string(), basePrice: z.number(), effectivePriceFrom: z.number(), category: z.object({ id: z.string(), name: z.string(), slug: z.string() }).nullable(), gender: genderSchema.nullable(), material: z.string().nullable(), soleType: z.string().nullable(), heelType: z.string().nullable(), occasions: z.array(z.object({ id: z.string(), name: z.string(), slug: z.string() })), isActive: z.boolean(), isAvailable: z.boolean(), createdAt: z.string() });
export const productDetailSchema = productSummarySchema.extend({ variants: z.array(catalogVariantSchema), media: z.array(z.object({ id: z.string(), type: z.enum(['IMAGE', 'VIDEO']), objectKey: z.string(), altText: z.string().nullable(), position: z.number(), mediaPosition: z.enum(['TOP', 'SIDE', 'BACK', 'SOLE', 'ON_FOOT', 'OTHER']).nullable(), isPrimary: z.boolean(), variantId: z.string().nullable() })) });
export const productListResponseSchema = z.object({ data: z.array(productSummarySchema), pagination: z.object({ page: z.number(), pageSize: z.number(), total: z.number(), totalPages: z.number() }) });

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateVariantInput = z.infer<typeof createVariantSchema>;
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;
export type ProductDetail = z.infer<typeof productDetailSchema>;
export type ProductListResponse = z.infer<typeof productListResponseSchema>;
