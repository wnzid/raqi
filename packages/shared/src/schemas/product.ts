import { z } from 'zod';

export const genderSchema = z.enum(['WOMEN', 'MEN', 'UNISEX', 'KIDS']);
export const moneySchema = z.coerce.number().finite().positive();
const salePriceSchema = z.coerce.number().finite().positive().nullable().optional();
const validateSalePrice = (value: { basePrice?: number | undefined; salePrice?: number | null | undefined }, ctx: z.RefinementCtx) => {
  if (value.salePrice != null && value.basePrice != null && value.salePrice >= value.basePrice) ctx.addIssue({ code: 'custom', path: ['salePrice'], message: 'Sale price must be lower than the regular price' });
};
export const sizeSchema = z.coerce.number().positive().max(99);
export const paginationSchema = z.object({ page: z.coerce.number().int().positive().default(1), pageSize: z.coerce.number().int().positive().max(100).default(24) });
export const productSortSchema = z.enum(['newest', 'price_asc', 'price_desc', 'bestsellers', 'rating']).default('newest');

const productFieldsSchema = z.object({
  familyId: z.string().cuid(), colorId: z.string().cuid(),
  description: z.string().trim().default(''), basePrice: moneySchema, salePrice: salePriceSchema, brandId: z.string().cuid().nullable().optional(), gender: genderSchema.nullable().optional(),
  material: z.string().trim().min(1).max(100).nullable().optional(), soleType: z.string().trim().min(1).max(100).nullable().optional(), heelType: z.string().trim().min(1).max(100).nullable().optional(),
  isActive: z.boolean().default(false), isNewArrival: z.boolean().default(false), publishedAt: z.coerce.date().nullable().optional(),
});
export const createProductSchema = productFieldsSchema.superRefine(validateSalePrice);
export const updateProductSchema = productFieldsSchema.partial().refine((value) => Object.keys(value).length > 0, 'At least one field is required').superRefine(validateSalePrice);

const variantFieldsSchema = z.object({
  sku: z.string().trim().min(1).max(100), colorId: z.string().cuid(), sizeEu: sizeSchema.nullable().optional(), sizeUk: sizeSchema.nullable().optional(), sizeUs: sizeSchema.nullable().optional(),
  stockQuantity: z.coerce.number().int().nonnegative().default(0), priceOverride: moneySchema.nullable().optional(), weightGrams: z.coerce.number().int().positive().nullable().optional(), isActive: z.boolean().default(true),
});
export const createVariantSchema = variantFieldsSchema.refine((value) => value.sizeEu != null || value.sizeUk != null || value.sizeUs != null, { message: 'At least one regional size is required' });
export const updateVariantSchema = variantFieldsSchema.partial().refine((value) => Object.keys(value).length > 0, 'At least one field is required');

export const productQuerySchema = paginationSchema.extend({
  q: z.string().trim().min(1).max(200).optional(),
  brand: z.string().trim().optional(), gender: genderSchema.optional(), color: z.string().trim().optional(), sizeEu: sizeSchema.optional(), sizeUk: sizeSchema.optional(), sizeUs: sizeSchema.optional(),
  material: z.string().trim().optional(), soleType: z.string().trim().optional(), minPrice: moneySchema.optional(), maxPrice: moneySchema.optional(),
  inStock: z.enum(['true', 'false']).transform((value) => value === 'true').optional(), newArrival: z.enum(['true', 'false']).transform((value) => value === 'true').optional(), sort: productSortSchema,
}).refine((value) => value.minPrice == null || value.maxPrice == null || value.minPrice <= value.maxPrice, { message: 'minPrice must not exceed maxPrice' });

export const catalogColorSchema = z.object({ id: z.string(), name: z.string(), slug: z.string(), hex: z.string().nullable() });
export const productFamilySchema = z.object({ id: z.string(), name: z.string(), slug: z.string() });
export const siblingColorwaySchema = z.object({ id: z.string(), slug: z.string(), color: catalogColorSchema, primaryImageUrl: z.string().url().nullable(), basePrice: z.number(), salePrice: z.number().nullable().optional(), isActive: z.boolean() });
export const catalogVariantSchema = z.object({ id: z.string(), sku: z.string(), color: catalogColorSchema, sizeEu: z.number().nullable(), sizeUk: z.number().nullable(), sizeUs: z.number().nullable(), stockQuantity: z.number().int(), isAvailable: z.boolean(), priceOverride: z.number().nullable(), effectivePrice: z.number(), weightGrams: z.number().nullable(), isActive: z.boolean() });
export const productSummarySchema = z.object({ id: z.string(), title: z.string(), slug: z.string(), family: productFamilySchema, color: catalogColorSchema, description: z.string(), basePrice: z.number(), salePrice: z.number().nullable().optional(), effectivePriceFrom: z.number(), primaryImageUrl: z.string().url().nullable(), brand: z.object({ id: z.string(), name: z.string(), slug: z.string() }).nullable(), gender: genderSchema.nullable(), material: z.string().nullable(), soleType: z.string().nullable(), heelType: z.string().nullable(), isActive: z.boolean(), isNewArrival: z.boolean().optional(), isAvailable: z.boolean(), availableSizesEu: z.array(z.number()).optional(), createdAt: z.string() });
export const productDetailSchema = productSummarySchema.extend({ siblings: z.array(siblingColorwaySchema), variants: z.array(catalogVariantSchema), media: z.array(z.object({ id: z.string(), type: z.enum(['IMAGE', 'VIDEO']), objectKey: z.string(), url: z.string().url(), altText: z.string().nullable(), position: z.number(), mediaPosition: z.enum(['TOP', 'SIDE', 'BACK', 'SOLE', 'ON_FOOT', 'OTHER']).nullable(), isPrimary: z.boolean(), variantId: z.string().nullable() })) });
export const productListResponseSchema = z.object({ data: z.array(productSummarySchema), pagination: z.object({ page: z.number(), pageSize: z.number(), total: z.number(), totalPages: z.number() }) });

export const colorwaySizeSchema = z.object({ sku: z.string().trim().min(1).max(100), sizeEu: sizeSchema, sizeUk: sizeSchema.nullable().optional(), sizeUs: sizeSchema.nullable().optional(), stockQuantity: z.coerce.number().int().nonnegative(), weightGrams: z.coerce.number().int().positive().nullable().optional(), isActive: z.boolean().default(true) });
export const productColorwayInputSchema = z.object({ colorId: z.string().cuid(), basePrice: moneySchema, salePrice: salePriceSchema, isActive: z.boolean().default(false), publishedAt: z.coerce.date().nullable().optional(), variants: z.array(colorwaySizeSchema).min(1, 'Add at least one size') }).superRefine((value,ctx)=>{validateSalePrice(value,ctx);const seen=new Set<number>();value.variants.forEach((variant,index)=>{if(seen.has(variant.sizeEu))ctx.addIssue({code:'custom',path:['variants',index,'sizeEu'],message:'EU sizes must be unique within a colorway'});seen.add(variant.sizeEu)});});
export const createProductFamilySchema = z.object({
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().default(''), brandId: z.string().cuid().nullable().optional(), gender: genderSchema.nullable().optional(), material: z.string().trim().max(100).nullable().optional(), soleType: z.string().trim().max(100).nullable().optional(), heelType: z.string().trim().max(100).nullable().optional(),
  colorways: z.array(productColorwayInputSchema).min(1, 'Add at least one colorway'),
}).superRefine((value,ctx)=>{if(new Set(value.colorways.map(v=>v.colorId)).size!==value.colorways.length)ctx.addIssue({code:'custom',path:['colorways'],message:'This model already has that colorway.'});});
export const updateProductFamilySchema=z.object({name:z.string().trim().min(2).max(160).optional()}).refine(value=>Object.keys(value).length>0,'At least one field is required');

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateVariantInput = z.infer<typeof createVariantSchema>;
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;
export type ProductDetail = z.infer<typeof productDetailSchema>;
export type ProductListResponse = z.infer<typeof productListResponseSchema>;
export type CreateProductFamilyInput = z.infer<typeof createProductFamilySchema>;
export type ProductColorwayInput = z.infer<typeof productColorwayInputSchema>;
export type UpdateProductFamilyInput=z.infer<typeof updateProductFamilySchema>;
