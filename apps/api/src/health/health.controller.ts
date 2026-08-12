import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { HealthResponse } from '@footwear/shared';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOkResponse({ schema: { example: { status: 'ok', service: 'api', timestamp: '2025-01-01T00:00:00.000Z' } } })
  getHealth(): HealthResponse { return { status: 'ok', service: 'api', timestamp: new Date().toISOString() }; }
}
