import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@footwear/database';
import { deliveryFeeForDistrict,type ShippingMethod } from '@footwear/shared';

export interface ResolvedShippingMethod { code: 'STANDARD'; name: string; amount: Prisma.Decimal; currency: 'BDT'; }
@Injectable()
export class ShippingService {
  private readonly standard: ResolvedShippingMethod = { code: 'STANDARD', name: 'Standard delivery', amount: new Prisma.Decimal(120), currency: 'BDT' };
  list(): ShippingMethod[] { return [{ ...this.standard, amount: this.standard.amount.toNumber() }]; }
  resolve(code: string,district: string): ResolvedShippingMethod { if (code !== this.standard.code) throw new NotFoundException('Invalid shipping method'); return {...this.standard,amount:new Prisma.Decimal(deliveryFeeForDistrict(district))}; }
}
