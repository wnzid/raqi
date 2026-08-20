import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { OrderDetail } from '@footwear/shared';
import { sendTransactionalEmail } from '@footwear/shared';
import { raqiContact } from '../config/raqi-contact';

const money=(value:number)=>`৳${new Intl.NumberFormat('en-BD',{maximumFractionDigits:2}).format(value)}`;
const escapeHtml=(value:string)=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
const size=(item:OrderDetail['items'][number])=>item.sizeEu!=null?String(item.sizeEu):item.sizeUk!=null?`UK ${item.sizeUk}`:item.sizeUs!=null?`US ${item.sizeUs}`:'N/A';

@Injectable()
export class OrderCancellationEmailService {
  private readonly logger=new Logger(OrderCancellationEmailService.name);
  constructor(private readonly config:ConfigService){}

  async send(order:OrderDetail){
    try{
      const contact=raqiContact(this.config);
      const textItems=order.items.map((item,index)=>`${index+1}. ${item.productName} | ${item.colorName}\nSize: ${size(item)}\nQuantity: ${item.quantity}\n${money(item.lineSubtotal)}`).join('\n\n');
      const htmlItems=order.items.map(item=>`<div style="border-bottom:1px solid #ddd;padding:12px 0"><strong>${escapeHtml(item.productName)} | ${escapeHtml(item.colorName)}</strong><br>Size: ${escapeHtml(size(item))}<br>Quantity: ${item.quantity}<br><strong>${money(item.lineSubtotal)}</strong></div>`).join('');
      await sendTransactionalEmail(
        {apiKey:this.config.getOrThrow('MAILJET_API_KEY'),secretKey:this.config.getOrThrow('MAILJET_SECRET_KEY'),fromEmail:this.config.get<string>('MAILJET_FROM_EMAIL')||this.config.getOrThrow('MAIL_FROM_EMAIL'),fromName:this.config.get<string>('MAILJET_FROM_NAME')||this.config.get<string>('MAIL_FROM_NAME')||'RAQI'},
        {to:order.contact.email,subject:`Your RAQI order #${order.orderNumber} has been cancelled`,text:`RAQI\n\nYour order has been cancelled.\n\nOrder #${order.orderNumber}\n\nOrder summary\n${textItems}\n\nSubtotal: ${money(order.subtotal)}\nDelivery: ${money(order.shippingAmount)}\nTotal: ${money(order.total)}\n\nIf you have any questions, contact us at:\n${contact.email}\n\nRAQI\nInstagram: ${contact.instagramUrl}\nFacebook: ${contact.facebookUrl}`,html:`<div style="font-family:Arial,sans-serif;color:#171717;line-height:1.6;max-width:560px"><p style="font-size:20px;font-weight:700;letter-spacing:.12em">RAQI</p><h1 style="font-size:24px">Your order has been cancelled</h1><p>Order <strong>#${escapeHtml(order.orderNumber)}</strong></p><h2 style="font-size:16px;margin-top:28px">Order summary</h2>${htmlItems}<div style="margin-top:18px"><div>Subtotal: <strong>${money(order.subtotal)}</strong></div><div>Delivery: <strong>${money(order.shippingAmount)}</strong></div><div style="margin-top:6px">Total: <strong>${money(order.total)}</strong></div></div><p style="margin-top:28px">If you have any questions, contact us at:<br><a href="mailto:${contact.email}" style="color:#171717">${contact.email}</a></p><div style="border-top:1px solid #ddd;margin-top:32px;padding-top:18px;font-size:13px;color:#666"><strong style="color:#171717">RAQI</strong><br><a href="${contact.instagramUrl}" style="color:#666">Instagram</a> | <a href="${contact.facebookUrl}" style="color:#666">Facebook</a></div></div>`},
      );
    }catch(error){this.logger.error(`Could not send cancellation email for ${order.orderNumber}`,error instanceof Error?error.stack:String(error))}
  }
}
