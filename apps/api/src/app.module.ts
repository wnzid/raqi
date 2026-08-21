import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
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
import { AuditModule } from './audit/audit.module';
import { SuperAdminModule } from './super-admin/super-admin.module';
import { AnnouncementModule } from './announcement/announcement.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '../../.env', isGlobal: true, cache: true, validate: validateEnvironment }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
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
    AuditModule,
    SuperAdminModule,
    AnnouncementModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
