import type {ProductListResponse} from '@footwear/shared';
export type HomeProduct=ProductListResponse['data'][number];
export function visibleColorways(products:HomeProduct[]){return products.filter(product=>product.isActive)}
export function selectLandingProducts(products:HomeProduct[],count=16){return visibleColorways(products).sort((a,b)=>Number(b.isAvailable)-Number(a.isAvailable)).slice(0,count)}
export function selectNewArrivals(products:HomeProduct[],count=16){return visibleColorways(products).filter(product=>product.isNewArrival).sort((a,b)=>Number(b.isAvailable)-Number(a.isAvailable)).slice(0,count)}
