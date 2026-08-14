import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { createAddressSchema, updateAddressSchema, updateProfileSchema, type CreateAddressInput, type UpdateAddressInput, type UpdateProfileInput } from '@footwear/shared';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AccountService } from './account.service';

@ApiTags('account') @ApiUnauthorizedResponse({ description: 'Authentication required' }) @UseGuards(AuthGuard) @Controller('account')
export class AccountController {
  constructor(private readonly account: AccountService) {}
  @Get() @ApiOkResponse({ description: 'Current customer account' }) get(@CurrentUser() user: AuthenticatedUser) { return this.account.get(user.id); }
  @Patch() @ApiOkResponse({ description: 'Profile updated' }) update(@CurrentUser() user: AuthenticatedUser, @Body(new ZodValidationPipe(updateProfileSchema)) input: UpdateProfileInput) { return this.account.update(user.id, input); }
  @Get('addresses') @ApiOkResponse({ description: 'Current customer addresses' }) addresses(@CurrentUser() user: AuthenticatedUser) { return this.account.addresses(user.id); }
  @Post('addresses') @ApiCreatedResponse({ description: 'Address created' }) createAddress(@CurrentUser() user: AuthenticatedUser, @Body(new ZodValidationPipe(createAddressSchema)) input: CreateAddressInput) { return this.account.createAddress(user.id, input); }
  @Patch('addresses/:id') updateAddress(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body(new ZodValidationPipe(updateAddressSchema)) input: UpdateAddressInput) { return this.account.updateAddress(user.id, id, input); }
  @Delete('addresses/:id') @HttpCode(204) @ApiNoContentResponse({ description: 'Address deleted' }) deleteAddress(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) { return this.account.deleteAddress(user.id, id); }
}
