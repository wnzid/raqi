import { z } from 'zod';

const internalLinkSchema = z.string().trim().max(300).regex(/^\/(?!\/)[^\s]*$/, 'Link must be an internal storefront path');
export const announcementColorSchema = z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/, 'Banner color must use #RRGGBB format').transform((value) => value.toUpperCase());

export const updateAnnouncementSchema = z.object({
  message: z.string().trim().min(1).max(300),
  backgroundColor: announcementColorSchema,
  isEnabled: z.boolean(),
  startsAt: z.coerce.date().nullable(),
  endsAt: z.coerce.date().nullable(),
  link: internalLinkSchema.nullable(),
}).refine((value) => !value.startsAt || !value.endsAt || value.endsAt > value.startsAt, { path: ['endsAt'], message: 'End time must be after start time' });

export const announcementAdminSchema = z.object({
  id: z.string(), message: z.string(), backgroundColor: announcementColorSchema, isEnabled: z.boolean(), startsAt: z.string().nullable(), endsAt: z.string().nullable(), link: z.string().nullable(), updatedAt: z.string().nullable(),
});
export const activeAnnouncementSchema = z.object({ message: z.string(), backgroundColor: announcementColorSchema, link: z.string().nullable() }).nullable();

export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;
export type AnnouncementAdmin = z.infer<typeof announcementAdminSchema>;
export type ActiveAnnouncement = z.infer<typeof activeAnnouncementSchema>;
