import { Module } from '@nestjs/common';
import { AdminGuard } from './admin.guard';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from './roles.guard';

@Module({ providers: [AuthGuard, AdminGuard, RolesGuard], exports: [AuthGuard, AdminGuard, RolesGuard] })
export class AuthModule {}
