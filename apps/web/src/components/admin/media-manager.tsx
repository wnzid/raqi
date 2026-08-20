'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import type { AdminProduct } from '@/lib/admin-api';
import { adminApi } from '@/lib/admin-api';
import { BlockingLoader } from './blocking-loader';
import { useAdminToast } from './toast';

export function MediaManager({ productId, media }: { productId: string; media: AdminProduct['media'] }) {
  const router = useRouter(); const toast = useAdminToast(); const [pending, setPending] = useState(false); const [progress, setProgress] = useState('');
  async function upload(files: File[]) { setPending(true); try { for (const [index, file] of files.entries()) { setProgress(`Uploading product images ${index + 1} / ${files.length}`); await adminApi.upload(productId, file, media.length + index); } toast.success(`${files.length} image${files.length === 1 ? '' : 's'} uploaded.`); router.refresh(); } catch (error) { toast.error(error instanceof Error ? error.message : 'Image upload failed. Existing images remain unchanged.'); } finally { setProgress(''); setPending(false); } }
  async function remove(id: string) { if (!confirm('Delete this image? The remaining images will keep their order.')) return; setPending(true); setProgress('Deleting product image…'); try { await adminApi.deleteMedia(id); toast.success('Image deleted.'); router.refresh(); } catch (error) { toast.error(error instanceof Error ? error.message : 'Image could not be deleted.'); } finally { setProgress(''); setPending(false); } }
  return <><BlockingLoader visible={pending} title={progress.startsWith('Deleting') ? 'Deleting image…' : 'Uploading images…'} message={progress} /><div aria-busy={pending} inert={pending ? true : undefined}><div className="mt-5 grid grid-cols-2 gap-2">{media.map((item, index) => <figure className="relative" key={item.id}><Image className="aspect-square w-full object-cover" src={item.url} alt="" width={400} height={400} /><button className="absolute right-1 top-1 h-8 w-8 rounded-full bg-white shadow" type="button" disabled={pending} aria-label="Delete image" onClick={() => void remove(item.id)}>×</button><figcaption className="mt-1 text-xs">{index === 0 ? 'Primary image' : `Image ${index + 1}`}</figcaption></figure>)}</div>{!media.length && <p className="my-5 text-sm muted">No images uploaded yet.</p>}<label className="label mt-4">Add photographs<input className="field" type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={pending} value="" onChange={(event) => void upload(Array.from(event.target.files ?? []))} /></label></div></>;
}
