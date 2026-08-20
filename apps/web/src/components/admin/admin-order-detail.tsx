'use client';
import { isInvoiceAvailable, type OrderDetail } from '@footwear/shared';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { formatBDT } from '@/components/catalog/product-card';
import { DownloadInvoiceButton } from '@/components/orders/download-invoice-button';
import { OrderActions } from './order-actions';

export function AdminOrderDetail({initialOrder}:{initialOrder:OrderDetail}){
  const router=useRouter(),[order,setOrder]=useState(initialOrder);
  function updated(next:OrderDetail){setOrder(next);router.refresh()}
  return <section><p className="eyebrow">Order fulfillment</p><div className="mt-3 flex flex-wrap items-end justify-between gap-4"><div><h1 className="title">{order.orderNumber}</h1><p className="mt-2 muted">{new Date(order.createdAt).toLocaleString()}</p>{isInvoiceAvailable(order)&&<div className="mt-4"><DownloadInvoiceButton admin orderNumber={order.orderNumber}/></div>}</div><span className="status">{order.status}</span></div><div className="mt-8 grid gap-6 lg:grid-cols-[1fr_22rem]"><div className="panel bg-white"><h2 className="text-lg font-semibold">Items</h2><ul className="mt-4 divide-y">{order.items.map(item=><li className="flex justify-between gap-4 py-4" key={item.id}><div><strong>{item.productName}</strong><p className="text-sm muted">{item.colorName} · {item.sku} · Qty {item.quantity}</p></div><strong>{formatBDT(item.lineSubtotal)}</strong></li>)}</ul><h2 className="mt-7 font-semibold">Delivery</h2><address className="mt-3 text-sm not-italic leading-6 muted">{order.contact.name} · {order.contact.phone}<br/>{order.shippingAddress.addressLine}, {order.shippingAddress.cityDistrict}<br/>{order.contact.email}</address></div><aside className="panel bg-white"><h2 className="text-lg font-semibold">Summary</h2><dl className="mt-5 space-y-3 text-sm"><div className="flex justify-between"><dt>Subtotal</dt><dd>{formatBDT(order.subtotal)}</dd></div><div className="flex justify-between"><dt>Shipping</dt><dd>{formatBDT(order.shippingAmount)}</dd></div><div className="flex justify-between border-t pt-3 font-semibold"><dt>Total</dt><dd>{formatBDT(order.total)}</dd></div></dl><div className="mt-6 border-t pt-5"><OrderActions number={order.orderNumber} status={order.status} onUpdated={updated}/></div></aside></div></section>;
}
