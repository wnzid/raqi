import { BadRequestException, Body, Controller, Get, Headers, Post, Req, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiConflictResponse, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { checkoutSchema, type CheckoutInput } from '@footwear/shared';
import { CartContextService } from '../cart/cart-context.service';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CheckoutService } from './checkout.service';
import { ShippingService } from './shipping.service';
import { TurnstileService } from './turnstile.service';
@ApiTags('checkout') @Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService, private readonly cartContext: CartContextService, private readonly shipping: ShippingService, private readonly turnstile: TurnstileService) {}
  @Get('shipping-methods') @ApiOkResponse() methods() { return this.shipping.list(); }
  @Post() @Throttle({ default: { limit: 5, ttl: 600_000 } }) @ApiCreatedResponse({ description: 'Order placed' }) @ApiConflictResponse({ description: 'Cart, price, or stock validation failed' }) async checkout(@Req() req: Request, @Res({ passthrough: true }) res: Response, @Headers('idempotency-key') idempotencyKey: string | undefined, @Body(new ZodValidationPipe(checkoutSchema)) input: CheckoutInput) { if (!idempotencyKey || !/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(idempotencyKey)) throw new BadRequestException('A valid Idempotency-Key header is required'); await this.turnstile.verify(input.turnstileToken, req.ip); const context = await this.cartContext.resolve(req, res); const order = await this.checkoutService.checkout(context, input, idempotencyKey); if (!context.userId) this.cartContext.clearGuest(res); return order; }
}
