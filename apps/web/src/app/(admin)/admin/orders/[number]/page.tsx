import { headers } from 'next/headers';
import { AdminOrderDetail } from '@/components/admin/admin-order-detail';
import { adminApi } from '@/lib/admin-api';

export default async function Page({params}:{params:Promise<{number:string}>}){
  const{number}=await params,requestHeaders=await headers();
  const order=await adminApi.order(number,{headers:{cookie:requestHeaders.get('cookie')??''}});
  return <AdminOrderDetail initialOrder={order}/>;
}
