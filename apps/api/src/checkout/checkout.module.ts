import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CartModule } from '../cart/cart.module';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { ShippingService } from './shipping.service';
import { OrderNotificationService } from './order-notification.service';
import { TurnstileService } from './turnstile.service';
import { RESERVATION_QUEUE, ReservationExpiryProcessor, ReservationScheduler } from './reservation-expiry.processor';
@Module({ imports: [CartModule,BullModule.registerQueue({name:RESERVATION_QUEUE})], controllers: [CheckoutController], providers: [CheckoutService, ShippingService,OrderNotificationService,TurnstileService,ReservationExpiryProcessor,ReservationScheduler] })
export class CheckoutModule {}
