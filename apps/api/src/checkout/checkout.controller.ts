import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { ApiConflictResponse, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { checkoutSchema, type CheckoutInput } from '@footwear/shared';
import { CartContextService } from '../cart/cart-context.service';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CheckoutService } from './checkout.service';
import { ShippingService } from './shipping.service';
@ApiTags('checkout') @Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService, private readonly cartContext: CartContextService, private readonly shipping: ShippingService) {}
  @Get('shipping-methods') @ApiOkResponse() methods() { return this.shipping.list(); }
  @Post() @ApiCreatedResponse({ description: 'Order placed' }) @ApiConflictResponse({ description: 'Cart, price, or stock validation failed' }) async checkout(@Req() req: Request, @Res({ passthrough: true }) res: Response, @Body(new ZodValidationPipe(checkoutSchema)) input: CheckoutInput) { const context = await this.cartContext.resolve(req, res); const order = await this.checkoutService.checkout(context, input); if (!context.userId) this.cartContext.clearGuest(res); return order; }
}
