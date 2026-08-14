import { Injectable, NotFoundException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import type { GuestOrderLookupInput, OrderDetail, OrderSummary } from '@footwear/shared';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { mapOrder, mapOrderSummary, orderInclude } from './order.mapper';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}
  async list(userId: string): Promise<{ data: OrderSummary[] }> { const orders = await this.prisma.order.findMany({ where: { userId }, include: orderInclude, orderBy: { createdAt: 'desc' } }); return { data: orders.map(mapOrderSummary) }; }
  async get(userId: string, orderNumber: string): Promise<OrderDetail> { const order = await this.prisma.order.findFirst({ where: { orderNumber, userId }, include: orderInclude }); if (!order) throw new NotFoundException('Order not found'); return mapOrder(order); }
  async guest(input: GuestOrderLookupInput): Promise<OrderDetail> { const guestAccessTokenHash = createHash('sha256').update(input.token).digest('hex'); const order = await this.prisma.order.findFirst({ where: { orderNumber: input.orderNumber, userId: null, guestAccessTokenHash }, include: orderInclude }); if (!order) throw new NotFoundException('Order not found'); return mapOrder(order); }
}
