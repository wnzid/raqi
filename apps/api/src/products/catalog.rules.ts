export const effectivePrice = (basePrice: number, salePrice: number | null, priceOverride: number | null): number => priceOverride ?? salePrice ?? basePrice;
export const variantAvailable = (isActive: boolean, stockQuantity: number): boolean => isActive && stockQuantity > 0;
export function compareCatalogPrice(a:{price:number;createdAt:Date;id:string},b:{price:number;createdAt:Date;id:string},direction:'asc'|'desc'){
  const difference=direction==='asc'?a.price-b.price:b.price-a.price;
  return difference||b.createdAt.getTime()-a.createdAt.getTime()||a.id.localeCompare(b.id);
}
