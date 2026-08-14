import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Req, Res } from '@nestjs/common';
import { ApiConflictResponse, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { addCartItemSchema, updateCartItemSchema, type AddCartItemInput, type UpdateCartItemInput } from '@footwear/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CartContextService } from './cart-context.service';
import { CartService } from './cart.service';

@ApiTags('cart') @Controller('cart')
export class CartController {
  constructor(private readonly cart: CartService, private readonly context: CartContextService) {}
  @Get() @ApiOkResponse({ description: 'Current guest or customer cart' }) async get(@Req() req: Request, @Res({ passthrough: true }) res: Response) { return this.cart.get(await this.context.resolve(req, res)); }
  @Post('items') @ApiOkResponse({ description: 'Item added to current cart' }) @ApiConflictResponse({ description: 'Variant unavailable or insufficient stock' }) async add(@Req() req: Request, @Res({ passthrough: true }) res: Response, @Body(new ZodValidationPipe(addCartItemSchema)) input: AddCartItemInput) { return this.cart.add(await this.context.resolve(req, res, true), input); }
  @Patch('items/:itemId') async update(@Req() req: Request, @Res({ passthrough: true }) res: Response, @Param('itemId') itemId: string, @Body(new ZodValidationPipe(updateCartItemSchema)) input: UpdateCartItemInput) { return this.cart.update(await this.context.resolve(req, res), itemId, input); }
  @Delete('items/:itemId') async remove(@Req() req: Request, @Res({ passthrough: true }) res: Response, @Param('itemId') itemId: string) { return this.cart.remove(await this.context.resolve(req, res), itemId); }
  @Delete() @HttpCode(204) @ApiNoContentResponse({ description: 'Current cart cleared' }) async clear(@Req() req: Request, @Res({ passthrough: true }) res: Response) { await this.cart.clear(await this.context.resolve(req, res)); }
  @Post('merge') async merge(@Req() req: Request, @Res({ passthrough: true }) res: Response) { const context = await this.context.resolve(req, res); const result = await this.cart.merge(context); this.context.clearGuest(res); return result; }
}
