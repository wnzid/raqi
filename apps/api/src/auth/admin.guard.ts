import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthenticatedUser } from './auth.types';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const user = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>().user;
    if (user?.role !== 'ADMIN') throw new ForbiddenException('Administrator access required');
    return true;
  }
}
