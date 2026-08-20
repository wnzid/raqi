import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DownloadInvoiceButton } from './download-invoice-button';

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

const pdfBlob = () => {
  const bytes = new TextEncoder().encode('%PDF-1.7 invoice');
  return { size: bytes.length, type: 'application/pdf', slice: (start: number, end: number) => ({ arrayBuffer: async () => bytes.slice(start, end).buffer }) } as Blob;
};

describe('DownloadInvoiceButton', () => {
  it('does not report a browser/download-manager interception as a failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, blob: vi.fn().mockResolvedValue(pdfBlob()) }));
    vi.stubGlobal('URL', { createObjectURL: vi.fn().mockReturnValue('blob:invoice'), revokeObjectURL: vi.fn() });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => { throw new Error('intercepted by download manager'); });
    render(<DownloadInvoiceButton orderNumber="RAQI-1" />);
    fireEvent.click(screen.getByRole('button', { name: /download invoice/i }));
    await waitFor(() => expect((screen.getByRole('button', { name: /download invoice/i }) as HTMLButtonElement).disabled).toBe(false));
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('reports a genuine HTTP failure as a download error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    render(<DownloadInvoiceButton orderNumber="RAQI-1" />);
    fireEvent.click(screen.getByRole('button', { name: /download invoice/i }));
    expect((await screen.findByRole('alert')).textContent).toBe('Could not download invoice. Please try again.');
  });
});
