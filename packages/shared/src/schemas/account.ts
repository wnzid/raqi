import { z } from 'zod';

const optionalText = (max: number) => z.string().trim().min(1).max(max).nullable().optional();
export const userRoleSchema = z.enum(['CUSTOMER', 'MANAGER', 'SUPER_ADMIN']);
export const updateProfileSchema = z.object({ firstName: optionalText(100), lastName: optionalText(100), phone: optionalText(30) }).refine((value) => Object.keys(value).length > 0, 'At least one field is required');

export const createAddressSchema = z.object({
  recipientName: z.string().trim().min(2).max(200), phone: z.string().trim().min(7).max(30),
  addressLine: z.string().trim().min(3).max(500), area: optionalText(200), cityDistrict: z.string().trim().min(2).max(200),
  postalCode: optionalText(20), country: z.string().trim().length(2).toUpperCase().default('BD'), isDefault: z.boolean().default(false),
});
export const updateAddressSchema = createAddressSchema.partial().refine((value) => Object.keys(value).length > 0, 'At least one field is required');
export const addressSchema = createAddressSchema.extend({ id: z.string(), createdAt: z.string(), updatedAt: z.string() });
export const accountSchema = z.object({
  id: z.string(), email: z.string().email(), name: z.string(), role: userRoleSchema, emailVerified: z.boolean(),
  profile: z.object({ firstName: z.string().nullable(), lastName: z.string().nullable(), phone: z.string().nullable() }),
});

export type UserRole = z.infer<typeof userRoleSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
export type CustomerAddress = z.infer<typeof addressSchema>;
export type CustomerAccount = z.infer<typeof accountSchema>;
