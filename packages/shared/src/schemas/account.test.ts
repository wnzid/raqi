import { describe, expect, it } from 'vitest';
import { createAddressSchema, updateProfileSchema } from './account';

describe('account validation', () => {
  it('accepts a Bangladesh delivery address', () => expect(createAddressSchema.parse({ recipientName: 'Rafi Ahmed', phone: '+8801712345678', addressLine: '12 Road 4', cityDistrict: 'Dhaka' })).toMatchObject({ country: 'BD' }));
  it('rejects an address without its required location', () => expect(() => createAddressSchema.parse({ recipientName: 'Rafi Ahmed', phone: '01712345678', addressLine: '', cityDistrict: '' })).toThrow());
  it('does not permit role through the profile contract', () => expect(updateProfileSchema.parse({ firstName: 'Rafi', role: 'ADMIN' })).not.toHaveProperty('role'));
});
