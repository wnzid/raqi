import { BadGatewayException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TurnstileService {
  constructor(private readonly config: ConfigService) {}
  async verify(token: string, remoteIp?: string): Promise<void> {
    if (this.config.get('NODE_ENV') !== 'production' && this.config.get('TURNSTILE_BYPASS') === 'true') return;
    const secret = this.config.get<string>('TURNSTILE_SECRET_KEY');
    if (!secret) throw new BadGatewayException('Checkout security verification is unavailable');
    const body = new URLSearchParams({ secret, response: token });
    if (remoteIp) body.set('remoteip', remoteIp);
    let response: Response;
    try { response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body, signal: AbortSignal.timeout(5000) }); }
    catch { throw new BadGatewayException('Checkout security verification is temporarily unavailable'); }
    if (!response.ok) throw new BadGatewayException('Checkout security verification is temporarily unavailable');
    const result = await response.json() as { success?: boolean; hostname?: string };
    const expected = this.config.get<string>('TURNSTILE_EXPECTED_HOSTNAME');
    if (!result.success || (expected && result.hostname !== expected)) throw new UnauthorizedException('Checkout security verification failed; please try again');
  }
}
