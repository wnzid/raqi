import { Body,Controller,Delete,Get,Param,Patch,Post,Query,UseGuards } from '@nestjs/common';
import { createBrandSchema,createColorSchema,inventoryUpdateSchema,updateBrandSchema,updateColorSchema } from '@footwear/shared';
import { z } from 'zod';
import { AdminGuard } from '../auth/admin.guard';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AdminCatalogService } from './admin-catalog.service';
type BrandInput=z.infer<typeof createBrandSchema>;type ColorInput=z.infer<typeof createColorSchema>;
@UseGuards(AuthGuard,AdminGuard) @Controller('admin/catalog') export class AdminCatalogController{
 constructor(private readonly catalog:AdminCatalogService){}
 @Get('products')products(@Query('page')p='1',@Query('pageSize')s='25'){return this.catalog.products(Math.max(1,Number(p)),Math.min(100,Math.max(1,Number(s))))}
 @Get('products/:id')product(@Param('id')id:string){return this.catalog.product(id)}
 @Patch('variants/:id/inventory')inventory(@CurrentUser()actor:AuthenticatedUser,@Param('id')id:string,@Body(new ZodValidationPipe(inventoryUpdateSchema))b:{stockQuantity:number}){return this.catalog.inventory(actor,id,b.stockQuantity)}
 @Get('brands')brands(){return this.catalog.brands()}
 @Post('brands')brand(@CurrentUser()actor:AuthenticatedUser,@Body(new ZodValidationPipe(createBrandSchema))b:BrandInput){return this.catalog.brand(actor,b)}
 @Patch('brands/:id')updateBrand(@CurrentUser()actor:AuthenticatedUser,@Param('id')id:string,@Body(new ZodValidationPipe(updateBrandSchema))b:Partial<BrandInput>){return this.catalog.updateBrand(actor,id,b)}
 @Delete('brands/:id')deleteBrand(@CurrentUser()actor:AuthenticatedUser,@Param('id')id:string){return this.catalog.deleteBrand(actor,id)}
 @Get('colors')colors(){return this.catalog.colors()}
 @Post('colors')color(@Body(new ZodValidationPipe(createColorSchema))b:ColorInput){return this.catalog.color(b)}
 @Patch('colors/:id')updateColor(@Param('id')id:string,@Body(new ZodValidationPipe(updateColorSchema))b:Partial<ColorInput>){return this.catalog.updateColor(id,b)}
}
