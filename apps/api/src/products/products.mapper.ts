import type { Prisma } from '@footwear/database';
import type { ProductDetail,ProductListResponse } from '@footwear/shared';
import { resolveMediaUrl } from '../media/media-url';
import { effectivePrice,variantAvailable } from './catalog.rules';

const colorSelect={id:true,name:true,slug:true,hex:true} as const;
export const productInclude={family:{include:{products:{where:{isActive:true,publishedAt:{not:null}},select:{id:true,slug:true,basePrice:true,salePrice:true,isActive:true,color:{select:colorSelect},media:{orderBy:{position:'asc' as const},take:1}}}}},color:{select:colorSelect},brand:true,media:{orderBy:{position:'asc' as const}},variants:{include:{color:true},orderBy:{sizeEu:'asc' as const}}} satisfies Prisma.ProductInclude;
type ProductRecord=Prisma.ProductGetPayload<{include:typeof productInclude}>;
const decimal=(value:{toNumber():number}|null)=>value?.toNumber()??null;
const mapColor=(value:ProductRecord['color'])=>({id:value.id,name:value.name,slug:value.slug,hex:value.hex});

export function mapProduct(product:ProductRecord):ProductDetail{
  const salePrice=decimal(product.salePrice);
  const variants=product.variants.map(variant=>({id:variant.id,sku:variant.sku,color:mapColor(variant.color),sizeEu:decimal(variant.sizeEu),sizeUk:decimal(variant.sizeUk),sizeUs:decimal(variant.sizeUs),stockQuantity:variant.stockQuantity,isAvailable:variantAvailable(variant.isActive,variant.stockQuantity),priceOverride:decimal(variant.priceOverride),effectivePrice:effectivePrice(product.basePrice.toNumber(),salePrice,decimal(variant.priceOverride)),weightGrams:variant.weightGrams,isActive:variant.isActive}));
  const primary=product.media.find(media=>media.isPrimary)??product.media[0];
  return{id:product.id,title:product.title,slug:product.slug,family:{id:product.family.id,name:product.family.name,slug:product.family.slug},color:mapColor(product.color),description:product.description,basePrice:product.basePrice.toNumber(),salePrice,effectivePriceFrom:variants.length?Math.min(...variants.map(v=>v.effectivePrice)):salePrice??product.basePrice.toNumber(),primaryImageUrl:primary?resolveMediaUrl(primary.objectKey):null,brand:product.brand&&{id:product.brand.id,name:product.brand.name,slug:product.brand.slug},gender:product.gender,material:product.material,soleType:product.soleType,heelType:product.heelType,isActive:product.isActive,isNewArrival:product.isNewArrival,isAvailable:variants.some(v=>v.isAvailable),availableSizesEu:[...new Set(variants.filter(v=>v.isAvailable&&v.sizeEu!=null).map(v=>v.sizeEu!))],createdAt:product.createdAt.toISOString(),siblings:product.family.products.map(sibling=>({id:sibling.id,slug:sibling.slug,color:mapColor(sibling.color),primaryImageUrl:sibling.media[0]?resolveMediaUrl(sibling.media[0].objectKey):null,basePrice:sibling.basePrice.toNumber(),salePrice:decimal(sibling.salePrice),isActive:sibling.isActive})),variants,media:product.media.map(media=>({id:media.id,type:media.type,objectKey:media.objectKey,url:resolveMediaUrl(media.objectKey),altText:media.altText,position:media.position,mediaPosition:media.mediaPosition,isPrimary:media.isPrimary,variantId:media.variantId}))};
}
export function mapProductList(products:ProductRecord[],page:number,pageSize:number,total:number):ProductListResponse{return{data:products.map(product=>{const d=mapProduct(product);const{siblings,variants,media,...summary}=d;void siblings;void variants;void media;return summary}),pagination:{page,pageSize,total,totalPages:Math.ceil(total/pageSize)}}}
