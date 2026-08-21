import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import PDFDocument from 'pdfkit';
import sharp from 'sharp';
import { raqiContact } from '../config/raqi-contact';
import { PrismaService } from '../infrastructure/prisma/prisma.service';

const invoiceStatuses = new Set(['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']);
const money = (value: { toNumber(): number }) => `BDT ${new Intl.NumberFormat('en-BD', { maximumFractionDigits: 2 }).format(value.toNumber())}`;
const date = (value: Date) => new Intl.DateTimeFormat('en-BD', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Dhaka' }).format(value);
export async function invoiceIconPng(icon:Buffer){
  const imageOffset=icon.readUInt32LE(18),payload=icon.subarray(imageOffset);
  if(payload.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return sharp(payload).png().toBuffer();
  const headerSize=payload.readUInt32LE(0),width=Math.abs(payload.readInt32LE(4)),height=Math.abs(payload.readInt32LE(8))/2,bits=payload.readUInt16LE(14);
  if(headerSize<40||!width||!height||bits!==32)throw new Error('Unsupported favicon ICO bitmap');
  const rgba=Buffer.alloc(width*height*4),pixels=headerSize;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){const source=pixels+((height-1-y)*width+x)*4,target=(y*width+x)*4;rgba[target]=payload[source+2]!;rgba[target+1]=payload[source+1]!;rgba[target+2]=payload[source]!;rgba[target+3]=payload[source+3]!}
  return sharp(rgba,{raw:{width,height,channels:4}}).png().toBuffer();
}

@Injectable()
export class InvoiceService {
  private readonly logger=new Logger(InvoiceService.name);
  private logoPromise:Promise<Buffer|null>|undefined;
  constructor(private readonly prisma: PrismaService, private readonly config: ConfigService) {}

  async generateOrderInvoice(orderNumber: string, ownerUserId?: string) {
    const order = await this.prisma.order.findFirst({ where: { orderNumber, ...(ownerUserId ? { userId: ownerUserId } : {}) }, include: { items: { orderBy: { createdAt: 'asc' } } } });
    if (!order) throw new NotFoundException('Order not found');
    if (!order.confirmedAt || !invoiceStatuses.has(order.status)) throw new ConflictException('Invoice is not available until the order is confirmed');

    const document = new PDFDocument({ size: 'A4', margin: 46, bufferPages: true, info: { Title: `RAQI Invoice ${order.orderNumber}`, Author: 'RAQI', CreationDate: order.confirmedAt, ModDate: order.confirmedAt } });
    const chunks: Buffer[] = [];
    document.on('data', (chunk: Buffer) => chunks.push(chunk));
    const completed = new Promise<Buffer>((resolve, reject) => { document.on('end', () => resolve(Buffer.concat(chunks))); document.on('error', reject); });

    await this.renderHeader(document);
    document.moveDown(1.4).font('Helvetica-Bold').fontSize(22).fillColor('#111111').text('INVOICE');
    const detailsTop = document.y + 18;
    this.renderCustomer(document, order, detailsTop);
    this.renderMetadata(document, order, detailsTop);
    document.y = Math.max(document.y, detailsTop + 118);
    this.renderItems(document, order.items);
    this.renderTotals(document, order);
    document.moveDown(2).font('Helvetica').fontSize(9).fillColor('#555555').text('Thank you for shopping with RAQI.', { align: 'center' });
    document.end();
    return { buffer: await completed, filename: `RAQI-Invoice-${this.safeReference(order.orderNumber)}.pdf` };
  }

  private async renderHeader(document: PDFKit.PDFDocument) {
    const top = document.y;
    const logo=await this.logo();
    if(logo){try{document.image(logo,46,top,{fit:[52,52],align:'center',valign:'center'});document.font('Helvetica-Bold').fontSize(15).fillColor('#111111').text('RAQI',108,top+18,{characterSpacing:2})}catch(error){this.logger.warn(`Invoice logo could not be embedded: ${error instanceof Error?error.message:String(error)}`);document.font('Helvetica-Bold').fontSize(26).fillColor('#111111').text('RAQI',46,top,{characterSpacing:3})}}
    else document.font('Helvetica-Bold').fontSize(26).fillColor('#111111').text('RAQI',46,top,{characterSpacing:3});
    const contact=raqiContact(this.config);
    const business = [this.config.get<string>('RAQI_BUSINESS_NAME') || 'RAQI', this.config.get<string>('RAQI_BUSINESS_ADDRESS'), contact.phone, contact.email, this.optionalRegistration('BIN', 'RAQI_BUSINESS_BIN'), this.optionalRegistration('TIN', 'RAQI_BUSINESS_TIN')].filter(Boolean).join('\n');
    document.font('Helvetica').fontSize(8.5).fillColor('#444444').text(business, 320, top, { width: 229, align: 'right', lineGap: 2 });
    document.y = Math.max(document.y, top + 74);
    document.moveTo(46, document.y).lineTo(549, document.y).strokeColor('#D8D8D8').stroke();
  }

  private renderCustomer(document: PDFKit.PDFDocument, order: InvoiceOrder, top: number) {
    document.font('Helvetica-Bold').fontSize(8).fillColor('#777777').text('CUSTOMER', 46, top, { characterSpacing: 1.2 });
    document.font('Helvetica-Bold').fontSize(10).fillColor('#111111').text(order.shippingRecipient, 46, top + 18, { width: 245 });
    const lines = [order.shippingPhone, order.contactEmail, order.shippingAddressLine, order.shippingArea, [order.shippingCityDistrict, order.shippingPostalCode].filter(Boolean).join(' '), order.shippingCountry].filter(Boolean).join('\n');
    document.font('Helvetica').fontSize(9).fillColor('#444444').text(lines, 46, top + 35, { width: 245, lineGap: 2 });
  }

  private renderMetadata(document: PDFKit.PDFDocument, order: InvoiceOrder, top: number) {
    const rows: Array<[string, string]> = [['Invoice No.', order.orderNumber], ['Invoice Date', date(order.confirmedAt!)], ['Order No.', order.orderNumber], ['Order Date', date(order.createdAt)], ['Payment Method', 'Cash on Delivery']];
    document.font('Helvetica-Bold').fontSize(8).fillColor('#777777').text('INVOICE DETAILS', 320, top, { characterSpacing: 1.2 });
    rows.forEach(([label, value], index) => { const y = top + 18 + index * 17; document.font('Helvetica').fontSize(8.5).fillColor('#666666').text(label, 320, y, { width: 92 }); document.font('Helvetica-Bold').fillColor('#111111').text(value, 412, y, { width: 137, align: 'right' }); });
  }

  private renderItems(document: PDFKit.PDFDocument, items: InvoiceOrder['items']) {
    const header = () => { this.ensureSpace(document, 42); const y = document.y; document.rect(46, y, 503, 25).fill('#F2F2F2'); document.font('Helvetica-Bold').fontSize(7.5).fillColor('#333333'); [['PRODUCT',46,230],['SIZE',276,45],['COLOR',321,62],['QTY',383,36],['UNIT PRICE',419,65],['TOTAL',484,65]].forEach(([text,x,width]) => document.text(String(text), Number(x) + 5, y + 9, { width: Number(width) - 10, align: Number(x) >= 383 ? 'right' : 'left' })); document.y = y + 25; };
    header();
    for (const item of items) {
      const productHeight = document.heightOfString(`${item.productName}\nSKU: ${item.sku}`, { width: 220, lineGap: 2 });
      const rowHeight = Math.max(38, productHeight + 14);
      if (document.y + rowHeight > 750) { document.addPage(); header(); }
      const y = document.y;
      document.font('Helvetica-Bold').fontSize(8.5).fillColor('#111111').text(item.productName, 51, y + 9, { width: 220 });
      document.font('Helvetica').fontSize(7).fillColor('#777777').text(`SKU: ${item.sku}`, 51, document.y + 2, { width: 220 });
      const size = item.sizeEu ? `EU ${item.sizeEu.toString()}` : item.sizeUk ? `UK ${item.sizeUk.toString()}` : item.sizeUs ? `US ${item.sizeUs.toString()}` : '-';
      document.font('Helvetica').fontSize(8).fillColor('#333333');
      document.text(size, 281, y + 11, { width: 35 }).text(item.colorName, 326, y + 11, { width: 52 }).text(String(item.quantity), 388, y + 11, { width: 26, align: 'right' }).text(money(item.unitPrice), 424, y + 11, { width: 55, align: 'right' }).font('Helvetica-Bold').text(money(item.lineSubtotal), 489, y + 11, { width: 55, align: 'right' });
      document.moveTo(46, y + rowHeight).lineTo(549, y + rowHeight).strokeColor('#E4E4E4').stroke(); document.y = y + rowHeight;
    }
  }

  private renderTotals(document: PDFKit.PDFDocument, order: InvoiceOrder) {
    this.ensureSpace(document, 115); document.moveDown(1.2); const start = document.y; const rows: Array<[string, string]> = [['Subtotal', money(order.subtotal)], ['Delivery', money(order.shippingAmount)], ['TOTAL', money(order.total)]];
    rows.forEach(([label, value], index) => { const y = start + index * 24; if (index === 2) document.moveTo(350, y - 7).lineTo(549, y - 7).strokeColor('#999999').stroke(); document.font(index === 2 ? 'Helvetica-Bold' : 'Helvetica').fontSize(index === 2 ? 11 : 9).fillColor('#111111').text(label, 350, y, { width: 95 }).text(value, 445, y, { width: 104, align: 'right' }); }); document.y = start + 72;
  }

  private ensureSpace(document: PDFKit.PDFDocument, height: number) { if (document.y + height > 760) document.addPage(); }
  private safeReference(value: string) { return value.replace(/[^a-zA-Z0-9_-]/g, '-'); }
  private optionalRegistration(label: string, key: string) { const value = this.config.get<string>(key)?.trim(); return value ? `${label}: ${value}` : undefined; }
  private logo(){return this.logoPromise??=this.loadLogo()}
  private async loadLogo(){
    const candidates=[join(process.cwd(),'apps','web','src','app','favicon.ico'),join(process.cwd(),'..','web','src','app','favicon.ico'),join(__dirname,'..','..','..','web','src','app','favicon.ico')];
    for(const path of candidates)try{return await invoiceIconPng(await readFile(path))}catch{/* Try the next supported workspace/build location. */}
    this.logger.warn('RAQI favicon was unavailable; invoice generation will continue without the logo.');return null;
  }
}

type InvoiceOrder = NonNullable<Awaited<ReturnType<PrismaService['order']['findFirst']>>> & { items: Array<{ productName: string; sku: string; colorName: string; sizeEu: { toString(): string } | null; sizeUk: { toString(): string } | null; sizeUs: { toString(): string } | null; unitPrice: { toNumber(): number }; quantity: number; lineSubtotal: { toNumber(): number } }> };
