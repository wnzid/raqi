'use client';

import React, { type FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminProduct, Taxonomy } from '@/lib/admin-api';
import { adminApi } from '@/lib/admin-api';
import { BlockingLoader } from './blocking-loader';
import { useAdminToast } from './toast';

const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const sku = (model: string, color: string, size: number) => `${slugify(model).replaceAll('-', '').slice(0, 8).toUpperCase()}-${slugify(color).slice(0, 3).toUpperCase()}-${size}`;

export function AddColorwayForm({ source, colors }: { source: AdminProduct; colors: Taxonomy[] }) {
  const router = useRouter(); const toast = useAdminToast();
  const [name, setName] = useState(''); const [price, setPrice] = useState(String(source.basePrice));
  const [salePrice, setSalePrice] = useState('');
  const [sizes, setSizes] = useState<number[]>(source.variants.map((variant) => Number(variant.sizeEu)).filter(Boolean));
  const [stocks, setStocks] = useState<Record<number, number>>({}); const [files, setFiles] = useState<File[]>([]);
  const [pending, setPending] = useState(false); const [progress, setProgress] = useState(''); const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (pending) return;
    if (!name.trim() || !sizes.length) { setError('Choose a color and add at least one size.'); return; }
    if (salePrice && (Number(salePrice) <= 0 || Number(salePrice) >= Number(price))) { setError('Sale price must be greater than zero and lower than the regular price.'); return; }
    setPending(true); setError(''); setProgress('Saving colorway and inventory…');
    try {
      let color = colors.find((item) => item.name.toLowerCase() === name.trim().toLowerCase());
      color ??= await adminApi.taxonomy('colors', { name: name.trim(), slug: slugify(name), hex: '#111111', isActive: true });
      const published = new FormData(event.currentTarget).get('published') === 'on';
      const product = await adminApi.addColorway(source.family.id, { colorId: color.id, basePrice: Number(price), salePrice: salePrice ? Number(salePrice) : null, isActive: published, publishedAt: published ? new Date().toISOString() : null, variants: sizes.map((size) => ({ sku: sku(source.family.name, name, size), sizeEu: size, sizeUk: null, sizeUs: null, stockQuantity: stocks[size] ?? 0, weightGrams: null, isActive: true })) });
      for (const [index, file] of files.entries()) { setProgress(`Uploading ${name} images ${index + 1} / ${files.length}`); await adminApi.upload(product.id, file, index); }
      toast.success('Colorway created successfully.'); router.push(`/admin/products/${product.id}`); router.refresh();
    } catch (caught) { const message = caught instanceof Error ? caught.message : 'Unable to add colorway.'; setError(message); toast.error(message); setPending(false); }
  }

  return <><BlockingLoader visible={pending} title="Creating colorway…" message={progress} /><form className="mt-8 max-w-3xl space-y-6" onSubmit={submit} aria-busy={pending} inert={pending ? true : undefined}>
    <section className="panel bg-white"><p className="eyebrow">Add colorway to {source.family.name}</p><label className="label mt-5">Color<input className="field" list="colors" value={name} onChange={(event) => setName(event.target.value)} required /></label><datalist id="colors">{colors.map((color) => <option key={color.id} value={color.name} />)}</datalist><p className="mt-3 text-sm"><strong>{source.family.name} | {name || 'Color'}</strong><span className="block muted">/{source.family.slug}-{slugify(name) || 'color'}</span></p><label className="label mt-4">Price (BDT)<input className="field" type="number" min="0" value={price} onChange={(event) => setPrice(event.target.value)} required /></label><label className="label mt-4">Images<input className="field" type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(event) => setFiles(Array.from(event.target.files ?? []))} /></label></section>
    <section className="panel bg-white"><h2 className="font-semibold">Sizes & starting stock</h2><div className="mt-3 flex flex-wrap gap-2">{Array.from({ length: 11 }, (_, index) => 36 + index).map((size) => <button className={`h-10 w-11 border ${sizes.includes(size) ? 'bg-black text-white' : ''}`} type="button" key={size} onClick={() => setSizes((values) => values.includes(size) ? values.filter((value) => value !== size) : [...values, size].sort())}>{size}</button>)}</div><div className="mt-4 space-y-2">{sizes.map((size) => <label className="label flex items-center justify-between" key={size}>EU {size}<input className="field max-w-32" type="number" min="0" value={stocks[size] ?? 0} onChange={(event) => setStocks((values) => ({ ...values, [size]: Number(event.target.value) }))} /></label>)}</div><label className="mt-5 block"><input type="checkbox" name="published" /> Publish this colorway</label></section>
    {error && <p className="text-red-700" role="alert">{error}</p>}<button className="button" disabled={pending}>Add colorway product</button>
  </form></>;
}
