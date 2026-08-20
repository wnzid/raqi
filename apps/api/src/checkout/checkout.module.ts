import { Module } from '@nestjs/common';
import { CartModule } from '../cart/cart.module';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { ShippingService } from './shipping.service';
import { OrderNotificationService } from './order-notification.service';
@Module({ imports: [CartModule], controllers: [CheckoutController], providers: [CheckoutService, ShippingService,OrderNotificationService] })
export class CheckoutModule {}
