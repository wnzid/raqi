export const effectivePrice = (basePrice: number, priceOverride: number | null): number => priceOverride ?? basePrice;
export const variantAvailable = (isActive: boolean, stockQuantity: number): boolean => isActive && stockQuantity > 0;
