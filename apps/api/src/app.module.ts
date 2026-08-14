import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validateEnvironment } from './config/environment';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { AccountModule } from './account/account.module';
import { AdminModule } from './admin/admin.module';
import { CartModule } from './cart/cart.module';
import { CheckoutModule } from './checkout/checkout.module';
import { OrdersModule } from './orders/orders.module';
import { MediaModule } from './media/media.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '../../.env', isGlobal: true, cache: true, validate: validateEnvironment }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({ connection: { url: config.getOrThrow<string>('REDIS_URL') } }),
    }),
    PrismaModule,
    HealthModule,
    ProductsModule,
    AccountModule,
    AdminModule,
    CartModule,
    CheckoutModule,
    OrdersModule,
    MediaModule,
  ],
})
export class AppModule {}
