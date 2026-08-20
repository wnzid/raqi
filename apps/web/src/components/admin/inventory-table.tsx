'use client';
import React, { useState } from 'react';
import type { AdminProduct } from '@/lib/admin-api';
import { adminApi } from '@/lib/admin-api';
import { useAdminToast } from './toast';

type InventoryRow={id:string;productTitle:string;sku:string;colorName:string;sizeEu:string|number|null;stockQuantity:number};
export function InventoryTable({products}:{products:AdminProduct[]}){
  const toast=useAdminToast(),[pendingId,setPendingId]=useState<string|null>(null),[rows,setRows]=useState<InventoryRow[]>(()=>products.flatMap(product=>product.variants.map(variant=>({id:variant.id,productTitle:product.title,sku:variant.sku,colorName:variant.color.name,sizeEu:variant.sizeEu,stockQuantity:variant.stockQuantity}))));
  async function update(row:InventoryRow,input:HTMLInputElement){const value=Number(input.value);if(value===row.stockQuantity)return;setPendingId(row.id);try{const saved=await adminApi.updateInventory(row.id,value) as {stockQuantity:number};setRows(current=>current.map(item=>item.id===row.id?{...item,stockQuantity:saved.stockQuantity}:item));input.value=String(saved.stockQuantity);toast.success(`${row.sku} stock updated.`)}catch(error){input.value=String(row.stockQuantity);toast.error(error instanceof Error?error.message:`Could not update ${row.sku}.`)}finally{setPendingId(null)}}
  return <div className="mt-7 overflow-x-auto bg-white"><table className="w-full min-w-[48rem] text-left text-sm"><thead className="border-b bg-[#eeeeea] text-xs uppercase tracking-wide"><tr><th className="p-3">Product</th><th>SKU</th><th>Color / size</th><th>Stock</th><th>Status</th></tr></thead><tbody>{rows.map(row=><tr className="border-b border-[var(--line)]" key={row.id}><td className="p-3 font-medium">{row.productTitle}</td><td>{row.sku}</td><td>{row.colorName} · EU {String(row.sizeEu??'N/A')}</td><td><input className="field !w-24" type="number" min={0} defaultValue={row.stockQuantity} disabled={pendingId===row.id} aria-label={`Stock for ${row.sku}`} onBlur={event=>void update(row,event.currentTarget)}/></td><td><span className={`status ${row.stockQuantity===0?'danger':row.stockQuantity<=3?'':'success'}`}>{pendingId===row.id?'Updating…':row.stockQuantity===0?'Out':row.stockQuantity<=3?'Low':'In stock'}</span></td></tr>)}</tbody></table></div>;
}
