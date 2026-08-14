import { Module } from '@nestjs/common';
import { CartContextService } from './cart-context.service';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
@Module({ controllers: [CartController], providers: [CartContextService, CartService], exports: [CartContextService] })
export class CartModule {}
