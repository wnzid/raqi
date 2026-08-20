export function normalizeProductSlug(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function createFamilySlug(name: string): string {
  return normalizeProductSlug(name) || 'product';
}

export function createProductSlug(familyName: string, colorName: string): string {
  return normalizeProductSlug(`${familyName} ${colorName}`) || 'product';
}

export async function createUniqueSlug(base: string, exists: (slug: string) => Promise<boolean>): Promise<string> {
  let suffix = 1;
  let candidate = base;
  while (await exists(candidate)) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
  return candidate;
}
