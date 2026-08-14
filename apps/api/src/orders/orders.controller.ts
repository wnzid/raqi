import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { guestOrderLookupSchema, type GuestOrderLookupInput } from '@footwear/shared';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { OrdersService } from './orders.service';

@ApiTags('orders') @Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}
  @Post('guest/lookup') @ApiOkResponse() @ApiNotFoundResponse() guest(@Body(new ZodValidationPipe(guestOrderLookupSchema)) input: GuestOrderLookupInput) { return this.orders.guest(input); }
  @Get() @UseGuards(AuthGuard) @ApiOkResponse() @ApiUnauthorizedResponse() list(@CurrentUser() user: AuthenticatedUser) { return this.orders.list(user.id); }
  @Get(':orderNumber') @UseGuards(AuthGuard) @ApiOkResponse() @ApiNotFoundResponse() get(@CurrentUser() user: AuthenticatedUser, @Param('orderNumber') orderNumber: string) { return this.orders.get(user.id, orderNumber); }
}
