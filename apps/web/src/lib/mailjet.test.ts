import { afterEach, describe, expect, it, vi } from 'vitest';
import { sendPasswordResetEmail } from './mailjet';

const environment = {
  MAILJET_API_KEY: process.env.MAILJET_API_KEY,
  MAILJET_SECRET_KEY: process.env.MAILJET_SECRET_KEY,
  MAILJET_FROM_EMAIL: process.env.MAILJET_FROM_EMAIL,
  MAILJET_FROM_NAME: process.env.MAILJET_FROM_NAME,
};

afterEach(() => {
  vi.unstubAllGlobals();
  Object.assign(process.env, environment);
});

describe('sendPasswordResetEmail', () => {
  it('sends the Better Auth reset URL through Mailjet', async () => {
    Object.assign(process.env, {
      MAILJET_API_KEY: 'public-key',
      MAILJET_SECRET_KEY: 'private-key',
      MAILJET_FROM_EMAIL: 'help@raqi.test',
      MAILJET_FROM_NAME: 'RAQI',
    });
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal('fetch', fetchMock);

    await sendPasswordResetEmail({ to: 'customer@example.com', resetUrl: 'https://raqi.test/reset-password?token=secure&next=1' });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.mailjet.com/v3.1/send');
    expect(request.headers).toMatchObject({ Authorization: `Basic ${Buffer.from('public-key:private-key').toString('base64')}` });
    const body = JSON.parse(String(request.body));
    expect(body.Messages[0].To).toEqual([{ Email: 'customer@example.com' }]);
    expect(body.Messages[0].HTMLPart).toContain('token=secure&amp;next=1');
    expect(body.Messages[0].HTMLPart).toContain('raqiofficial.bd@gmail.com');
    expect(body.Messages[0].HTMLPart).toContain('https://www.instagram.com/raqiofficial.bd');
    expect(body.Messages[0].HTMLPart).toContain('https://www.facebook.com/raqiofficial.bd');
  });

  it('fails before making a request when credentials are absent', async () => {
    delete process.env.MAILJET_API_KEY;
    delete process.env.MAILJET_SECRET_KEY;
    delete process.env.MAILJET_FROM_EMAIL;
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(sendPasswordResetEmail({ to: 'customer@example.com', resetUrl: 'https://raqi.test/reset' })).rejects.toThrow('MAILJET_API_KEY');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
