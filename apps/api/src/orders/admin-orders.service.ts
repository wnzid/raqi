import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { AdminOrderQuery } from '@footwear/shared';
import { Prisma, type OrderStatus } from '@footwear/database';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { mapOrder, orderInclude } from './order.mapper';
import { canTransitionOrder } from './order-lifecycle';
import { OrderConfirmationEmailService } from './order-confirmation-email.service';
import { OrderCancellationEmailService } from './order-cancellation-email.service';

@Injectable()
export class AdminOrdersService {
  constructor(private readonly prisma: PrismaService, private readonly confirmationEmail: OrderConfirmationEmailService, private readonly cancellationEmail: OrderCancellationEmailService) {}
  async list(query: AdminOrderQuery) {
    const baseWhere: Prisma.OrderWhereInput = {
      orderNumber: query.orderNumber ? { contains: query.orderNumber, mode: 'insensitive' } : undefined,
      contactEmail: query.email ? { contains: query.email, mode: 'insensitive' } : undefined,
      paymentStatus: query.paymentStatus,
      paymentMethod: query.paymentMethod,
      createdAt: query.dateFrom || query.dateTo ? { gte: query.dateFrom, lte: query.dateTo } : undefined,
      OR: query.q ? [
        { orderNumber: { contains: query.q, mode: 'insensitive' } },
        { contactName: { contains: query.q, mode: 'insensitive' } },
        { contactEmail: { contains: query.q, mode: 'insensitive' } },
        { contactPhone: { contains: query.q, mode: 'insensitive' } },
        { shippingRecipient: { contains: query.q, mode: 'insensitive' } },
        { shippingPhone: { contains: query.q, mode: 'insensitive' } },
      ] : undefined,
    };
    const where: Prisma.OrderWhereInput = { ...baseWhere, status: query.status };
    const orderBy: Prisma.OrderOrderByWithRelationInput = query.sort === 'oldest' ? { createdAt: 'asc' } : query.sort === 'total_desc' ? { total: 'desc' } : query.sort === 'total_asc' ? { total: 'asc' } : { createdAt: 'desc' };
    const [rows, total, grouped] = await this.prisma.$transaction([
      this.prisma.order.findMany({ where, select: { orderNumber: true, status: true, total: true, createdAt: true, confirmedAt: true, contactName: true, contactEmail: true, contactPhone: true, shippingRecipient: true, shippingPhone: true, shippingCityDistrict: true }, orderBy, skip: (query.page - 1) * query.pageSize, take: query.pageSize }),
      this.prisma.order.count({ where }),
      this.prisma.order.groupBy({ by: ['status'], where: baseWhere, orderBy: { status: 'asc' }, _count: { status: true } }),
    ]);
    const statusCounts: Record<OrderStatus, number> = { PENDING: 0, CONFIRMED: 0, PROCESSING: 0, SHIPPED: 0, DELIVERED: 0, CANCELLED: 0 };
    for (const group of grouped as unknown as Array<{ status: OrderStatus; _count: { status: number } }>) statusCounts[group.status] = group._count.status;
    return {
      data: rows.map((order) => ({ ...order, total: order.total.toNumber(), createdAt: order.createdAt.toISOString(), confirmedAt: order.confirmedAt?.toISOString() ?? null })),
      statusCounts,
      pagination: { page: query.page, pageSize: query.pageSize, total, totalPages: Math.ceil(total / query.pageSize) },
    };
  }
  async get(number: string) { const order = await this.prisma.order.findUnique({ where: { orderNumber: number }, include: orderInclude }); if (!order) throw new NotFoundException('Order not found'); return mapOrder(order); }
  async status(number: string, status: OrderStatus) {
    const order = await this.prisma.order.findUnique({ where: { orderNumber: number }, include: { items: true } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status === status) return this.get(number);
    if (!canTransitionOrder(order.status, status)) throw new ConflictException(`Cannot transition ${order.status} to ${status}`);
    const confirmedAt = status === 'CONFIRMED' ? new Date() : undefined;
    await this.prisma.$transaction(async (transaction) => {
      const transitioned = await transaction.order.updateMany({ where: { id: order.id, status: order.status }, data: { status, ...(confirmedAt ? { confirmedAt } : {}), ...(status === 'DELIVERED' ? { paymentStatus: 'PAID' as const } : {}) } });
      if (transitioned.count !== 1) throw new ConflictException('Order status changed; reload and try again');
      if (status === 'CANCELLED') for (const item of order.items) if (item.variantId) await transaction.productVariant.updateMany({ where: { id: item.variantId }, data: { stockQuantity: { increment: item.quantity } } });
    });
    if (order.status === 'PENDING' && status === 'CONFIRMED') await this.confirmationEmail.send(order);
    const updated = await this.get(number);
    if (status === 'CANCELLED') await this.cancellationEmail.send(updated);
    return updated;
  }
}
