import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AdminOrderListItem } from '@/lib/admin-api';
import { AdminOrderList } from './admin-order-list';

const push=vi.fn();
vi.mock('next/navigation',()=>({useRouter:()=>({push,refresh:vi.fn()})}));
const order=(status:AdminOrderListItem['status'],confirmedAt:string|null=null):AdminOrderListItem=>({orderNumber:`RAQI-${status}`,status,total:8560,createdAt:'2026-08-20T10:00:00.000Z',confirmedAt,contactName:'Rafi Customer',contactEmail:'rafi@example.com',contactPhone:'01700000000',shippingRecipient:'Nadia Recipient',shippingPhone:'01800000000',shippingCityDistrict:'Dhaka'});

afterEach(()=>{cleanup();push.mockReset()});
describe('AdminOrderList',()=>{
 it('shows fulfillment snapshots and only valid pending actions',()=>{const{container}=render(<AdminOrderList orders={[order('PENDING')]}/>);expect(container.querySelector('tbody')?.textContent).toContain('Nadia Recipient');expect(container.querySelector('tbody')?.textContent).toContain('01800000000');expect(container.querySelector('tbody')?.textContent).toContain('Dhaka');expect(screen.getAllByRole('button',{name:'Confirm order'}).length).toBeGreaterThan(0);expect(screen.getAllByRole('button',{name:'Cancel order'}).length).toBeGreaterThan(0);expect(screen.queryByRole('button',{name:/Download invoice/i})).toBeNull()});
 it('offers the existing invoice action only after confirmation',()=>{render(<AdminOrderList orders={[order('CONFIRMED','2026-08-20T11:00:00.000Z')]}/>);expect(screen.getAllByRole('button',{name:/Download invoice/i}).length).toBeGreaterThan(0);expect(screen.getAllByRole('button',{name:'Mark processing'}).length).toBeGreaterThan(0);expect(screen.queryByRole('button',{name:'Mark shipped'})).toBeNull()});
 it('renders the operational empty state',()=>{render(<AdminOrderList orders={[]}/>);expect(screen.getByText('No orders found')).toBeTruthy()});
});
