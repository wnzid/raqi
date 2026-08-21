import { Injectable,Logger,type OnModuleDestroy,type OnModuleInit } from '@nestjs/common';
import type { Prisma } from '@footwear/database';
import type { AuditAction } from '@footwear/shared';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import type { AuthenticatedUser } from '../auth/auth.types';
import { ConfigService } from '@nestjs/config';

const CLEANUP_INTERVAL_MS=60*60*1000;

@Injectable()
export class AuditService implements OnModuleInit,OnModuleDestroy{
 private readonly logger=new Logger(AuditService.name);
 private timer?:ReturnType<typeof setInterval>;
 constructor(private readonly prisma:PrismaService,private readonly config?:ConfigService){}
 onModuleInit(){void this.cleanup().catch(error=>this.logger.error('Audit retention cleanup failed',error));this.timer=setInterval(()=>void this.cleanup().catch(error=>this.logger.error('Audit retention cleanup failed',error)),CLEANUP_INTERVAL_MS);this.timer.unref?.()}
 onModuleDestroy(){if(this.timer)clearInterval(this.timer)}
 cleanup(now=new Date()){const retentionMs=(this.config?.get<number>('AUDIT_RETENTION_DAYS')??3)*24*60*60*1000;return this.prisma.auditLog.deleteMany({where:{createdAt:{lt:new Date(now.getTime()-retentionMs)}}})}
 write(actor:AuthenticatedUser,action:AuditAction,entityType:string,entityId:string|null,metadata?:Prisma.InputJsonObject,tx:Prisma.TransactionClient=this.prisma){return tx.auditLog.create({data:{actorUserId:actor.id,actorRole:actor.role,action,entityType,entityId,metadata}})}
}
