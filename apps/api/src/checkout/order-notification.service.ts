import { Injectable,Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Prisma } from '@footwear/database';
import { sendTransactionalEmail } from '@footwear/shared';
import { orderInclude } from '../orders/order.mapper';

type OrderSnapshot=Prisma.OrderGetPayload<{include:typeof orderInclude}>;
const money=(value:{toNumber():number})=>`৳${new Intl.NumberFormat('en-BD',{maximumFractionDigits:2}).format(value.toNumber())}`;
const date=(value:Date)=>new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',year:'numeric',timeZone:'Asia/Dhaka'}).format(value);
const payment=(value:string)=>value==='CASH_ON_DELIVERY'?'Cash on Delivery':value.toLowerCase().replaceAll('_',' ').replace(/^./,character=>character.toUpperCase());
const status=(value:string)=>value.toLowerCase().replace(/^./,character=>character.toUpperCase());
const size=(item:OrderSnapshot['items'][number])=>item.sizeEu?item.sizeEu.toString():item.sizeUk?`${item.sizeUk.toString()} UK`:item.sizeUs?`${item.sizeUs.toString()} US`:'Unspecified';
const escapeHtml=(value:string)=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');

@Injectable()
export class OrderNotificationService{
 private readonly logger=new Logger(OrderNotificationService.name);
 constructor(private readonly config:ConfigService){}
 async send(order:OrderSnapshot):Promise<void>{
  try{
   const lines=order.items.flatMap((item,index)=>[`${index+1}. ${item.productName} | ${item.colorName}`,`   Size: ${size(item)}`,`   Quantity: ${item.quantity}`,`   Unit price: ${money(item.unitPrice)}`,`   Total: ${money(item.lineSubtotal)}`]);
   const text=['RAQI: New Order','','A new order has been placed on the RAQI website.','','Order summary',`Order: ${order.orderNumber}`,`Date: ${date(order.createdAt)}`,`Status: ${status(order.status)}`,`Payment: ${payment(order.paymentMethod)}`,'','Customer',`Name: ${order.contactName}`,`Phone: ${order.contactPhone}`,`Email: ${order.contactEmail}`,'','Delivery address',`Recipient: ${order.shippingRecipient}`,`Phone: ${order.shippingPhone}`,`Address: ${order.shippingAddressLine}`,`Area / Locality: ${order.shippingArea??''}`,`District: ${order.shippingCityDistrict}`,`Postal code: ${order.shippingPostalCode??''}`,'','Items','',...lines,'','Order totals',`Subtotal: ${money(order.subtotal)}`,`Delivery: ${money(order.shippingAmount)}`,`Total: ${money(order.total)}`,'','Please open the RAQI admin panel to review and process this order.'].join('\n');
   const itemHtml=order.items.map((item,index)=>`<li style="margin-bottom:16px"><strong>${index+1}. ${escapeHtml(item.productName)} | ${escapeHtml(item.colorName)}</strong><br>Size: ${escapeHtml(size(item))}<br>Quantity: ${item.quantity}<br>Unit price: ${money(item.unitPrice)}<br>Total: ${money(item.lineSubtotal)}</li>`).join('');
   const html=`<div style="font-family:Arial,sans-serif;color:#171717;line-height:1.6;max-width:640px"><h1>RAQI: New Order</h1><p>A new order has been placed on the RAQI website.</p><h2>Order summary</h2><p>Order: <strong>${escapeHtml(order.orderNumber)}</strong><br>Date: ${date(order.createdAt)}<br>Status: ${status(order.status)}<br>Payment: ${payment(order.paymentMethod)}</p><h2>Customer</h2><p>Name: ${escapeHtml(order.contactName)}<br>Phone: ${escapeHtml(order.contactPhone)}<br>Email: ${escapeHtml(order.contactEmail)}</p><h2>Delivery address</h2><p>Recipient: ${escapeHtml(order.shippingRecipient)}<br>Phone: ${escapeHtml(order.shippingPhone)}<br>Address: ${escapeHtml(order.shippingAddressLine)}<br>Area / Locality: ${escapeHtml(order.shippingArea??'')}<br>District: ${escapeHtml(order.shippingCityDistrict)}<br>Postal code: ${escapeHtml(order.shippingPostalCode??'')}</p><h2>Items</h2><ol>${itemHtml}</ol><h2>Order totals</h2><p>Subtotal: ${money(order.subtotal)}<br>Delivery: ${money(order.shippingAmount)}<br><strong>Total: ${money(order.total)}</strong></p><p>Please open the RAQI admin panel to review and process this order.</p></div>`;
   await sendTransactionalEmail({apiKey:this.config.getOrThrow('MAILJET_API_KEY'),secretKey:this.config.getOrThrow('MAILJET_SECRET_KEY'),fromEmail:this.config.get<string>('MAILJET_FROM_EMAIL')||this.config.getOrThrow('MAIL_FROM_EMAIL'),fromName:this.config.get<string>('MAILJET_FROM_NAME')||this.config.get<string>('MAIL_FROM_NAME')||'RAQI'},{to:this.config.getOrThrow('ORDER_NOTIFICATION_EMAIL'),subject:'New order at website',text,html});
  }catch(error){this.logger.error(`Failed to send new-order notification for ${order.orderNumber}`,error instanceof Error?error.stack:String(error))}
 }
}
