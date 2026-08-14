import { Injectable } from '@nestjs/common';
import type { Request, Response } from 'express';
import { createHash, randomBytes } from 'node:crypto';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../auth/auth';

export const GUEST_CART_COOKIE = 'raqi_guest_cart';
export interface CartContext { userId?: string; guestTokenHash?: string; }
const hashToken = (token: string): string => createHash('sha256').update(token).digest('hex');

@Injectable()
export class CartContextService {
  async resolve(request: Request, response: Response, createGuest = false): Promise<CartContext> {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
    const token = this.readCookie(request.headers.cookie, GUEST_CART_COOKIE);
    if (session?.user.isActive !== false && session?.user.id) return { userId: session.user.id, ...(token ? { guestTokenHash: hashToken(token) } : {}) };
    if (token) return { guestTokenHash: hashToken(token) };
    if (!createGuest) return {};
    const newToken = randomBytes(32).toString('base64url');
    response.cookie(GUEST_CART_COOKIE, newToken, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 1000 * 60 * 60 * 24 * 30, path: '/' });
    return { guestTokenHash: hashToken(newToken) };
  }

  clearGuest(response: Response): void { response.clearCookie(GUEST_CART_COOKIE, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' }); }
  private readCookie(header: string | undefined, name: string): string | undefined { return header?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1); }
}
