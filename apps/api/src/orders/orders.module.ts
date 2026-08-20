import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { AdminOrdersController } from './admin-orders.controller'; import { AdminOrdersService } from './admin-orders.service';
import { InvoiceService } from './invoice.service';
import { OrderConfirmationEmailService } from './order-confirmation-email.service';
import { OrderCancellationEmailService } from './order-cancellation-email.service';
@Module({ imports: [AuthModule], controllers: [OrdersController, AdminOrdersController], providers: [OrdersService, AdminOrdersService, InvoiceService, OrderConfirmationEmailService, OrderCancellationEmailService] })
export class OrdersModule {}
