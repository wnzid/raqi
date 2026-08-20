'use client';
import type { OrderStatus } from '@footwear/database';
import type { OrderDetail } from '@footwear/shared';
import React, { useState } from 'react';
import { adminApi } from '@/lib/admin-api';

export const orderTransitions:Record<OrderStatus,Array<[string,OrderStatus]>>={PENDING:[['Confirm order','CONFIRMED'],['Cancel order','CANCELLED']],CONFIRMED:[['Mark processing','PROCESSING'],['Cancel order','CANCELLED']],PROCESSING:[['Mark shipped','SHIPPED'],['Cancel order','CANCELLED']],SHIPPED:[['Mark delivered','DELIVERED']],DELIVERED:[],CANCELLED:[]};

export function OrderActions({number,status,onUpdated}:{number:string;status:OrderStatus;onUpdated:(order:OrderDetail)=>void}){
  const[pending,setPending]=useState<OrderStatus|null>(null),[message,setMessage]=useState('');
  return <div className="flex flex-wrap gap-2">{orderTransitions[status].map(([label,target])=><button className={`button ${target==='CANCELLED'?'secondary':''}`} disabled={pending!==null} key={target} onClick={async()=>{if(target==='CANCELLED'&&!confirm(`Cancel order ${number}? Inventory will be returned to stock.`))return;setPending(target);setMessage('');try{const updated=await adminApi.status(number,target);onUpdated(updated);setMessage(`Order updated to ${updated.status.toLowerCase()}.`)}catch{setMessage('The order could not be updated. Its status may have changed.')}finally{setPending(null)}}}>{pending===target?`${label.replace(/ order$/,'')}…`:label}</button>)}<p className="w-full text-sm" role="status">{message}</p></div>;
}
