export const cartVariantSellable = (variantActive: boolean, productActive: boolean, stockQuantity: number): boolean => variantActive && productActive && stockQuantity > 0;
export const mergedCartQuantity = (guestQuantity: number, customerQuantity: number, stockQuantity: number): number => Math.min(guestQuantity + customerQuantity, stockQuantity);
