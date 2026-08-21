import { afterEach, describe, expect, it, vi } from 'vitest';
import { sendAccountCreatedEmail } from './account-created-email';

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe('sendAccountCreatedEmail', () => {
  it('sends account details and the password setup link immediately', async () => {
    vi.stubEnv('MAILJET_API_KEY','key');vi.stubEnv('MAILJET_SECRET_KEY','secret');vi.stubEnv('MAILJET_FROM_EMAIL','support@raqi.dev');
    const fetch=vi.fn().mockResolvedValue(new Response(null,{status:200}));vi.stubGlobal('fetch',fetch);
    await sendAccountCreatedEmail({to:'manager@example.com',name:'Store Manager',role:'MANAGER',resetUrl:'https://raqi.dev/reset-password?token=secure'});
    const init=fetch.mock.calls[0]![1] as RequestInit,body=JSON.parse(String(init.body)),message=body.Messages[0];
    expect(message.Subject).toBe('Your RAQI account has been created');
    expect(message.TextPart).toContain('RAQI Manager account has been created for manager@example.com');
    expect(message.TextPart).toContain('https://raqi.dev/reset-password?token=secure');
    expect(message.HTMLPart).toContain('Set your password');
  });
});
