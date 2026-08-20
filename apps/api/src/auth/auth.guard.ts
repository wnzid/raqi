import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from './auth';
import type { AuthenticatedUser } from './auth.types';
import { PrismaService } from '../infrastructure/prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly prisma?: PrismaService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
    if (!session) throw new UnauthorizedException('Authentication required');
    const authoritative=this.prisma?await this.prisma.user.findUnique({where:{id:session.user.id},select:{id:true,email:true,name:true,role:true,isActive:true}}):session.user;
    if (!authoritative || authoritative.isActive === false) throw new UnauthorizedException('Authentication required');
    request.user = { id: authoritative.id, email: authoritative.email, name: authoritative.name, role: authoritative.role as AuthenticatedUser['role'] };
    return true;
  }
}
