import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiForbiddenResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AdminGuard } from '../auth/admin.guard';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('admin') @Controller('admin')
export class AdminController {
  @Get('access') @UseGuards(AuthGuard, AdminGuard) @ApiOkResponse({ description: 'Admin boundary is available' }) @ApiUnauthorizedResponse() @ApiForbiddenResponse()
  access() { return { allowed: true as const }; }
}
