import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { HealthResponse } from '@footwear/shared';
import { PrismaService } from '../infrastructure/prisma/prisma.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma:PrismaService){}
  @Get()
  @ApiOkResponse({ schema: { example: { status: 'ok', service: 'api', timestamp: '2025-01-01T00:00:00.000Z' } } })
  getHealth(): HealthResponse { return { status: 'ok', service: 'api', timestamp: new Date().toISOString() }; }
  @Get('live') live():HealthResponse{return this.getHealth()}
  @Get('ready') async ready():Promise<HealthResponse>{try{await this.prisma.$queryRaw`SELECT 1`;return this.getHealth()}catch{throw new ServiceUnavailableException('Database is unavailable')}}
}
