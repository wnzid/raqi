import type { OrderStatus } from '@footwear/database';
const allowed: Record<OrderStatus, readonly OrderStatus[]> = { PENDING: ['CONFIRMED', 'CANCELLED'], CONFIRMED: ['PROCESSING', 'CANCELLED'], PROCESSING: ['SHIPPED', 'CANCELLED'], SHIPPED: ['DELIVERED'], DELIVERED: [], CANCELLED: [] };
export const canTransitionOrder = (from: OrderStatus, to: OrderStatus): boolean => allowed[from].includes(to);
