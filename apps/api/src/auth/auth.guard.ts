import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from './auth';
import type { AuthenticatedUser } from './auth.types';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
    if (!session || session.user.isActive === false) throw new UnauthorizedException('Authentication required');
    request.user = { id: session.user.id, email: session.user.email, name: session.user.name, role: session.user.role as AuthenticatedUser['role'] };
    return true;
  }
}
