import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import type { OrderDetail } from '@footwear/shared';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AdminOrderDetail } from './admin-order-detail';

const{refresh,status}=vi.hoisted(()=>({refresh:vi.fn(),status:vi.fn()}));
vi.mock('next/navigation',()=>({useRouter:()=>({refresh})}));
vi.mock('@/lib/admin-api',()=>({adminApi:{status}}));
vi.mock('@/components/orders/download-invoice-button',()=>({DownloadInvoiceButton:()=> <button>Download invoice</button>}));
const order=(state:OrderDetail['status'],confirmedAt:string|null=null):OrderDetail=>({orderNumber:'RAQI-1',status:state,paymentStatus:'UNPAID',paymentMethod:'CASH_ON_DELIVERY',currency:'BDT',subtotal:6500,shippingAmount:60,total:6560,createdAt:'2026-08-20T10:00:00.000Z',confirmedAt,contact:{name:'Customer',email:'customer@example.com',phone:'01700000000'},shippingAddress:{recipientName:'Customer',phone:'01700000000',addressLine:'Road 1',area:null,cityDistrict:'Dhaka',postalCode:null,country:'BD'},shippingMethod:{code:'STANDARD',name:'Standard delivery'},items:[]});

afterEach(()=>{cleanup();status.mockReset();refresh.mockReset()});
describe('AdminOrderDetail',()=>{
  it('immediately replaces status-dependent UI from the mutation response',async()=>{status.mockResolvedValue(order('CONFIRMED','2026-08-20T11:00:00.000Z'));render(<AdminOrderDetail initialOrder={order('PENDING')}/>);fireEvent.click(screen.getByRole('button',{name:'Confirm order'}));await waitFor(()=>expect(screen.getByText('CONFIRMED')).toBeTruthy());expect(screen.queryByRole('button',{name:'Confirm order'})).toBeNull();expect(screen.getByRole('button',{name:'Mark processing'})).toBeTruthy();expect(screen.getByRole('button',{name:'Download invoice'})).toBeTruthy();expect(refresh).toHaveBeenCalledOnce()});
});
