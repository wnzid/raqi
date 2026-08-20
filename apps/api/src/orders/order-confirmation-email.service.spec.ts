/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-base-to-string */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OrderConfirmationEmailService } from './order-confirmation-email.service';

afterEach(() => vi.unstubAllGlobals());

function setup(ok = true) {
  const fetchMock = vi.fn().mockResolvedValue({ ok, status: ok ? 200 : 503 });
  vi.stubGlobal('fetch', fetchMock);
  const invoice = { buffer: Buffer.from('%PDF invoice snapshot'), filename: 'RAQI-Invoice-RAQI-1.pdf' };
  const invoices = { generateOrderInvoice: vi.fn().mockResolvedValue(invoice) };
  const values: Record<string, string> = { MAILJET_API_KEY: 'key', MAILJET_SECRET_KEY: 'secret', MAILJET_FROM_EMAIL: 'orders@raqi.test', MAILJET_FROM_NAME: 'RAQI' };
  const config = { getOrThrow: vi.fn((key: string) => values[key]), get: vi.fn((key: string) => values[key]) };
  return { service: new OrderConfirmationEmailService(invoices as never, config as never), fetchMock, invoices };
}

describe('OrderConfirmationEmailService', () => {
  it('attaches the in-memory invoice and addresses the saved customer email', async () => {
    const { service, fetchMock, invoices } = setup();
    await service.send({ orderNumber: 'RAQI-1', contactEmail: 'customer@example.com', total: { toNumber: () => 8560 } });
    expect(invoices.generateOrderInvoice).toHaveBeenCalledWith('RAQI-1');
    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse(String(request.body));
    expect(body.Messages[0].To).toEqual([{ Email: 'customer@example.com' }]);
    expect(body.Messages[0].HTMLPart).toContain('raqiofficial.bd@gmail.com');
    expect(body.Messages[0].HTMLPart).toContain('https://www.instagram.com/raqiofficial.bd');
    expect(body.Messages[0].HTMLPart).toContain('https://www.facebook.com/raqiofficial.bd');
    expect(body.Messages[0].Attachments).toEqual([{ ContentType: 'application/pdf', Filename: 'RAQI-Invoice-RAQI-1.pdf', Base64Content: Buffer.from('%PDF invoice snapshot').toString('base64') }]);
  });

  it('contains Mailjet failure so a committed confirmation remains successful', async () => {
    const { service } = setup(false);
    await expect(service.send({ orderNumber: 'RAQI-1', contactEmail: 'customer@example.com', total: { toNumber: () => 8560 } })).resolves.toBeUndefined();
  });
});
