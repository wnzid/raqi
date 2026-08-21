import { ConflictException,Injectable,NotFoundException } from '@nestjs/common';
import { Prisma } from '@footwear/database';
import type { AuthenticatedUser } from '../auth/auth.types';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { resolveMediaUrl } from '../media/media-url';
const include={family:{include:{products:{select:{id:true,title:true,slug:true,basePrice:true,isActive:true,isNewArrival:true,publishedAt:true,color:true,variants:{select:{id:true,stockQuantity:true}},media:{orderBy:{position:'asc' as const},take:1}}}}},color:true,brand:true,variants:{include:{color:true}},media:{orderBy:{position:'asc' as const}}} satisfies Prisma.ProductInclude;
@Injectable() export class AdminCatalogService{
 constructor(private readonly prisma:PrismaService,private readonly audit:AuditService){}
 async products(page:number,pageSize:number){const[rows,total]=await this.prisma.$transaction([this.prisma.product.findMany({include,orderBy:[{family:{name:'asc'}},{color:{name:'asc'}}],skip:(page-1)*pageSize,take:pageSize}),this.prisma.product.count()]);return[rows.map(row=>({...row,media:row.media.map(media=>({...media,url:resolveMediaUrl(media.objectKey)}))})),total]as const}
 async product(id:string){const value=await this.prisma.product.findUnique({where:{id},include});if(!value)throw new NotFoundException('Product not found');return{...value,media:value.media.map(media=>({...media,url:resolveMediaUrl(media.objectKey)}))}}
 async inventory(actor:AuthenticatedUser,id:string,stockQuantity:number){try{const variant=await this.prisma.productVariant.update({where:{id},data:{stockQuantity}});await this.audit.write(actor,'INVENTORY_UPDATED','ProductVariant',id,{productId:variant.productId,stockQuantity});return variant}catch{throw new NotFoundException('Variant not found')}}
 brands(){return this.prisma.brand.findMany({orderBy:{name:'asc'}})}
 async brand(actor:AuthenticatedUser,data:Prisma.BrandCreateInput){try{const brand=await this.prisma.brand.create({data});await this.audit.write(actor,'BRAND_CREATED','Brand',brand.id,{name:brand.name});return brand}catch(error){if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==='P2002')throw new ConflictException('A brand with this name already exists.');throw error}}
 async updateBrand(actor:AuthenticatedUser,id:string,data:Prisma.BrandUpdateInput){const brand=await this.prisma.brand.update({where:{id},data});await this.audit.write(actor,'BRAND_UPDATED','Brand',brand.id,{name:brand.name});return brand}
 async deleteBrand(actor:AuthenticatedUser,id:string){const brand=await this.prisma.brand.findUnique({where:{id}});if(!brand)throw new NotFoundException('Brand not found');await this.prisma.$transaction(async tx=>{await tx.brand.delete({where:{id}});await this.audit.write(actor,'BRAND_DELETED','Brand',id,{name:brand.name},tx)});return{deleted:true,id}}
 colors(){return this.prisma.color.findMany({orderBy:{name:'asc'}})}
 async color(data:Prisma.ColorCreateInput){const existing=await this.prisma.color.findFirst({where:{OR:[{slug:data.slug},{name:{equals:data.name,mode:'insensitive'}}]}});return existing??this.prisma.color.create({data})}
 updateColor(id:string,data:Prisma.ColorUpdateInput){return this.prisma.color.update({where:{id},data})}
}
