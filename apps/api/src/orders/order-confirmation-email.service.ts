import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sendTransactionalEmail } from '@footwear/shared';
import { raqiContact } from '../config/raqi-contact';
import { InvoiceService } from './invoice.service';

@Injectable()
export class OrderConfirmationEmailService {
  private readonly logger = new Logger(OrderConfirmationEmailService.name);
  constructor(private readonly invoices: InvoiceService, private readonly config: ConfigService) {}

  async send(order: { orderNumber: string; contactEmail: string; total: { toNumber(): number } }) {
    try {
      const invoice = await this.invoices.generateOrderInvoice(order.orderNumber);
      const total = `BDT ${new Intl.NumberFormat('en-BD', { maximumFractionDigits: 2 }).format(order.total.toNumber())}`;
      const contact = raqiContact(this.config);
      await sendTransactionalEmail(
        { apiKey: this.config.getOrThrow('MAILJET_API_KEY'), secretKey: this.config.getOrThrow('MAILJET_SECRET_KEY'), fromEmail: this.config.get<string>('MAILJET_FROM_EMAIL') || this.config.getOrThrow('MAIL_FROM_EMAIL'), fromName: this.config.get<string>('MAILJET_FROM_NAME') || this.config.get<string>('MAIL_FROM_NAME') || 'RAQI' },
        { to: order.contactEmail, subject: `Your RAQI order ${order.orderNumber} has been confirmed`, text: `Your order has been confirmed.\n\nOrder ${order.orderNumber}\nTotal: ${total}\n\nWe've attached your invoice to this email.\n\nRAQI\n${contact.email}\nInstagram: ${contact.instagramUrl}\nFacebook: ${contact.facebookUrl}`, html: `<div style="font-family:Arial,sans-serif;color:#171717;line-height:1.6;max-width:560px"><p style="font-size:20px;font-weight:700;letter-spacing:.12em">RAQI</p><h1 style="font-size:24px">Your order has been confirmed</h1><p>Order <strong>${order.orderNumber}</strong></p><p>Total: <strong>${total}</strong></p><p>We've attached your invoice to this email. You can also download it anytime from your RAQI account.</p><div style="border-top:1px solid #ddd;margin-top:32px;padding-top:18px;font-size:13px;color:#666"><strong style="color:#171717">RAQI</strong><br><a href="mailto:${contact.email}" style="color:#666">${contact.email}</a><br><a href="${contact.instagramUrl}" style="color:#666">Instagram</a> | <a href="${contact.facebookUrl}" style="color:#666">Facebook</a></div></div>`, attachments: [{ contentType: 'application/pdf', filename: invoice.filename, content: invoice.buffer }] },
      );
    } catch (error) {
      this.logger.error(`Could not send confirmation email for ${order.orderNumber}`, error instanceof Error ? error.stack : String(error));
    }
  }
}
