'use client';

import { Download } from 'lucide-react';
import React from 'react';
import { useState } from 'react';
import { publicEnvironment } from '@/lib/env';

async function isPdf(blob: Blob) {
  if (!blob.size || !blob.type.toLowerCase().includes('pdf')) return false;
  const signature = new Uint8Array(await blob.slice(0, 5).arrayBuffer());
  return String.fromCharCode(...signature) === '%PDF-';
}

export function DownloadInvoiceButton({ orderNumber, admin = false }: { orderNumber: string; admin?: boolean }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function download() {
    setPending(true);
    setError('');

    let blob: Blob;
    try {
      const scope = admin ? '/admin/orders' : '/orders';
      const response = await fetch(`${publicEnvironment.NEXT_PUBLIC_API_URL}${scope}/${encodeURIComponent(orderNumber)}/invoice`, { credentials: 'include' });
      if (!response.ok) throw new Error('Invoice request failed');
      blob = await response.blob();
      if (!await isPdf(blob)) throw new Error('Invalid invoice response');
    } catch {
      setError('Could not download invoice. Please try again.');
      setPending(false);
      return;
    }

    let url: string;
    let link: HTMLAnchorElement;
    try {
      url = URL.createObjectURL(blob);
      link = document.createElement('a');
      link.href = url;
      link.download = `RAQI-Invoice-${orderNumber}.pdf`;
      document.body.appendChild(link);
    } catch {
      setError('Could not download invoice. Please try again.');
      setPending(false);
      return;
    }

    // The application is done once the valid PDF is handed to the browser.
    // Download managers may intercept the click or alter subsequent browser events.
    try { link.click(); } catch { /* Browser/download-manager completion is not observable. */ }
    setPending(false);
    window.setTimeout(() => {
      try { link.remove(); } catch {}
      try { URL.revokeObjectURL(url); } catch {}
    }, 60_000);
  }

  return <div><button className="inline-flex items-center gap-2 text-sm font-semibold underline disabled:opacity-50" disabled={pending} onClick={download}><Download size={15} />{pending ? 'Downloading…' : 'Download invoice'}</button>{error && <p className="mt-2 text-sm text-red-700" role="alert">{error}</p>}</div>;
}
