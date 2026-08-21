import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { PrismaService } from '../infrastructure/prisma/prisma.service';

export const RESERVATION_QUEUE = 'order-reservations';

@Injectable()
export class ReservationScheduler implements OnModuleInit {
  constructor(@InjectQueue(RESERVATION_QUEUE) private readonly queue: Queue) {}
  async onModuleInit(){await this.queue.upsertJobScheduler('expire-pending-orders',{every:60_000},{name:'expire-pending-orders',opts:{removeOnComplete:100,removeOnFail:500}})}
}

@Processor(RESERVATION_QUEUE)
export class ReservationExpiryProcessor extends WorkerHost {
  private readonly logger=new Logger(ReservationExpiryProcessor.name);
  constructor(private readonly prisma:PrismaService){super()}
  async process(job:Job){if(job.name!=='expire-pending-orders')return;const ids=await this.prisma.order.findMany({where:{status:'PENDING',reservationExpiresAt:{lte:new Date()}},select:{id:true},take:100});for(const {id} of ids)try{await this.expire(id)}catch(error){this.logger.error(`Failed to expire reservation for order ${id}`,error instanceof Error?error.stack:undefined);throw error}}
  async expire(id:string){return this.prisma.$transaction(async tx=>{const claimed=await tx.order.updateMany({where:{id,status:'PENDING',reservationExpiresAt:{lte:new Date()}},data:{status:'CANCELLED',reservationExpiresAt:null}});if(claimed.count!==1)return false;const order=await tx.order.findUniqueOrThrow({where:{id},select:{items:{select:{variantId:true,quantity:true}}}});for(const item of order.items){if(!item.variantId)throw new Error(`Cannot restore inventory for missing variant on order ${id}`);const restored=await tx.productVariant.updateMany({where:{id:item.variantId},data:{stockQuantity:{increment:item.quantity}}});if(restored.count!==1)throw new Error(`Inventory restoration failed for order ${id}`)}return true})}
}
