import { Body, Controller, Get, Param, Patch, Query, StreamableFile, UseGuards } from '@nestjs/common';
import type { OrderStatus } from '@footwear/database';
import { adminOrderQuerySchema, updateOrderStatusSchema, type AdminOrderQuery } from '@footwear/shared';
import { AdminGuard } from '../auth/admin.guard';
import { AuthGuard } from '../auth/auth.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AdminOrdersService } from './admin-orders.service';
import { InvoiceService } from './invoice.service';

@UseGuards(AuthGuard, AdminGuard)
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly orders: AdminOrdersService, private readonly invoices: InvoiceService) {}
  @Get() list(@Query(new ZodValidationPipe(adminOrderQuerySchema)) query: AdminOrderQuery) { return this.orders.list(query); }
  @Get(':number') get(@Param('number') number: string) { return this.orders.get(number); }
  @Get(':number/invoice') async invoice(@Param('number') number: string) { const invoice = await this.invoices.generateOrderInvoice(number); return new StreamableFile(invoice.buffer, { type: 'application/pdf', disposition: `attachment; filename="${invoice.filename}"` }); }
  @Patch(':number/status') status(@Param('number') number: string, @Body(new ZodValidationPipe(updateOrderStatusSchema)) body: { status: OrderStatus }) { return this.orders.status(number, body.status); }
}
