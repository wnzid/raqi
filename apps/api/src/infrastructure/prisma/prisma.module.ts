import { Global, Module } from '@nestjs/common';
import { PrismaService,prismaService } from './prisma.service';

@Global()
@Module({ providers: [{provide:PrismaService,useValue:prismaService}], exports: [PrismaService] })
export class PrismaModule {}
