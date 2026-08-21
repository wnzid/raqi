'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import type { AdminProduct } from '@/lib/admin-api';
import { adminApi } from '@/lib/admin-api';
import { BlockingLoader } from './blocking-loader';
import { useAdminToast } from './toast';

export function MediaManager({ productId, media }: { productId: string; media: AdminProduct['media'] }) {
  const router = useRouter();
  const toast = useAdminToast();
  const [pending, setPending] = useState(false);
  const [progress, setProgress] = useState('');
  const ordered = [...media].sort((a, b) => a.position - b.position);

  async function upload(files: File[]) {
    if (!files.length || pending) return;
    setPending(true);
    try {
      for (const [index, file] of files.entries()) {
        setProgress(`Uploading product images ${index + 1} / ${files.length}`);
        await adminApi.upload(productId, file, ordered.length + index);
      }
      toast.success(`${files.length} image${files.length === 1 ? '' : 's'} uploaded.`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Image upload failed. Existing images remain unchanged.');
    } finally { setProgress(''); setPending(false); }
  }

  async function makePrimary(id: string) {
    if (pending || ordered[0]?.id === id) return;
    const selected = ordered.find(item => item.id === id);
    if (!selected) return;
    const normalized = [selected, ...ordered.filter(item => item.id !== id)].map((item, position) => ({ id: item.id, position }));
    setPending(true);
    setProgress('Setting primary image…');
    try {
      await adminApi.reorderMedia(productId, normalized);
      toast.success('Primary image updated.');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Primary image could not be updated.');
    } finally { setProgress(''); setPending(false); }
  }

  async function remove(id: string) {
    if (!confirm('Delete this image? The remaining images will keep their order.')) return;
    setPending(true);
    setProgress('Deleting product image…');
    try { await adminApi.deleteMedia(id); toast.success('Image deleted.'); router.refresh(); }
    catch (error) { toast.error(error instanceof Error ? error.message : 'Image could not be deleted.'); }
    finally { setProgress(''); setPending(false); }
  }

  const deleting = progress.startsWith('Deleting');
  const selecting = progress.startsWith('Setting');
  return <><BlockingLoader visible={pending} title={deleting ? 'Deleting image…' : selecting ? 'Setting primary image…' : 'Uploading images…'} message={progress} /><div aria-busy={pending} inert={pending ? true : undefined}><div className="mt-5 grid grid-cols-2 gap-2">{ordered.map((item, index) => <figure className={`relative overflow-hidden border ${index === 0 ? 'border-black' : 'border-transparent'}`} key={item.id}><Image className="aspect-square w-full object-cover" src={item.url} alt="" width={400} height={400} /><button className="absolute left-1 top-1 grid h-8 w-8 place-items-center rounded-full bg-white text-lg shadow" type="button" disabled={pending || index === 0} aria-label={index === 0 ? 'Primary image' : `Set image ${index + 1} as primary`} title={index === 0 ? 'Primary image' : 'Set as primary'} onClick={() => void makePrimary(item.id)}>{index === 0 ? '★' : '☆'}</button><button className="absolute right-1 top-1 h-8 w-8 rounded-full bg-white shadow" type="button" disabled={pending} aria-label="Delete image" onClick={() => void remove(item.id)}>×</button><figcaption className="mt-1 text-xs">{index === 0 ? 'PRIMARY' : `Image ${index + 1}`}</figcaption></figure>)}</div>{!ordered.length && <p className="my-5 text-sm muted">No images uploaded yet.</p>}<label className="label mt-4">Add photographs<input className="field" type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={pending} value="" onChange={(event) => void upload(Array.from(event.target.files ?? []))} /></label></div></>;
}
