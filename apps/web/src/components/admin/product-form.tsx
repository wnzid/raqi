'use client';

import React, { type FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Taxonomy } from '@/lib/admin-api';
import { adminApi } from '@/lib/admin-api';
import { uploadColorwayMedia, type CreatedFamily, type FailedUpload } from '@/lib/product-create-workflow';
import { BlockingLoader } from './blocking-loader';
import { useAdminToast } from './toast';

type Size = { eu: number; uk: string; us: string; stock: number };
type Colorway = { key: string; name: string; hex: string; price: string; salePrice: string; sizes: Size[]; images: File[] };
const fresh = (): Colorway => ({ key: crypto.randomUUID(), name: '', hex: '#111111', price: '', salePrice: '', sizes: [], images: [] });
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const skuPart = (value: string) => slugify(value).replaceAll('-', '').slice(0, 8).toUpperCase();

export function ProductForm({ brands, colors }: { brands: Taxonomy[]; colors: Taxonomy[] }) {
  const router = useRouter();
  const toast = useAdminToast();
  const [model, setModel] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');
  const [created, setCreated] = useState<CreatedFamily | null>(null);
  const [failed, setFailed] = useState<FailedUpload[]>([]);
  const [colorways, setColorways] = useState<Colorway[]>([fresh()]);
  const [familySalePrice, setFamilySalePrice] = useState('');
  const familySlug = slugify(model);
  const totals = useMemo(() => ({ variants: colorways.reduce((sum, colorway) => sum + colorway.sizes.length, 0), stock: colorways.reduce((sum, colorway) => sum + colorway.sizes.reduce((count, size) => count + size.stock, 0), 0) }), [colorways]);

  const change = (key: string, update: (colorway: Colorway) => Colorway) => setColorways((items) => items.map((item) => item.key === key ? update(item) : item));
  function toggleSize(key: string, eu: number) { change(key, (colorway) => colorway.sizes.some((size) => size.eu === eu) ? { ...colorway, sizes: colorway.sizes.filter((size) => size.eu !== eu) } : { ...colorway, sizes: [...colorway.sizes, { eu, uk: '', us: '', stock: 0 }].sort((a, b) => a.eu - b.eu) }); }
  function updateSize(key: string, eu: number, field: 'uk' | 'us' | 'stock', value: string) { change(key, (colorway) => ({ ...colorway, sizes: colorway.sizes.map((size) => size.eu === eu ? { ...size, [field]: field === 'stock' ? Number(value) : value } : size) })); }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (created || pending) return;
    const data = new FormData(event.currentTarget);
    const brandId = String(data.get('brandId') ?? '');
    if (!model.trim()) { setError('Enter a model name.'); return; }
    if (brandId && !brands.some((brand) => brand.id === brandId && brand.isActive)) { setError('This brand is no longer available. Please select another brand.'); return; }
    if (colorways.some((colorway) => !colorway.name.trim() || !colorway.price || !colorway.sizes.length || colorway.sizes.some((size) => size.stock < 0))) { setError('Every colorway needs a valid color, price, sizes, and non-negative stock.'); return; }
    if (colorways.some((colorway) => colorway.salePrice && (Number(colorway.salePrice) <= 0 || Number(colorway.salePrice) >= Number(colorway.price)))) { setError('Every sale price must be greater than zero and lower than that colorway’s regular price.'); return; }
    if (new Set(colorways.map((colorway) => colorway.name.trim().toLowerCase())).size !== colorways.length) { setError('This model already has that colorway.'); return; }
    for (const colorway of colorways) for (const file of colorway.images) if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) { setError(`${file.name} must be a JPEG, PNG, or WebP up to 5 MB.`); return; }

    setPending(true);
    setError('');
    setProgress('Saving product and colorwaysâ€¦');
    try {
      const resolved: Taxonomy[] = [];
      for (const colorway of colorways) {
        let color = colors.find((item) => item.name.toLowerCase() === colorway.name.trim().toLowerCase());
        color ??= await adminApi.taxonomy('colors', { name: colorway.name.trim(), slug: slugify(colorway.name), hex: colorway.hex, isActive: true });
        resolved.push(color);
      }
      const publish = data.get('published') === 'on';
      const result = await adminApi.createFamily({
        name: model.trim(), description: String(data.get('description') ?? ''), brandId: brandId || null, gender: data.get('gender') || null,
        colorways: colorways.map((colorway, index) => ({ colorId: resolved[index]!.id, basePrice: Number(colorway.price), salePrice: colorway.salePrice ? Number(colorway.salePrice) : null, isActive: publish, publishedAt: publish ? new Date().toISOString() : null, variants: colorway.sizes.map((size) => ({ sku: `${skuPart(model)}-${skuPart(colorway.name).slice(0, 3)}-${size.eu}`, sizeEu: size.eu, sizeUk: size.uk ? Number(size.uk) : null, sizeUs: size.us ? Number(size.us) : null, stockQuantity: size.stock, weightGrams: null, isActive: true })) })),
      });
      setCreated(result);
      const staged = colorways.map((colorway, index) => ({ colorId: resolved[index]!.id, colorName: colorway.name, files: colorway.images }));
      const failures = await uploadColorwayMedia(result, staged, adminApi.upload, setProgress);
      setFailed(failures);
      if (failures.length) {
        const message = `Product data was saved, but ${failures.length} image${failures.length === 1 ? '' : 's'} failed to upload.`;
        setError(`${message} Retry below or open the product.`);
        toast.error(message);
      } else toast.success('Product created successfully.');
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Could not create product.';
      setError(message);
      toast.error(message);
    } finally {
      setProgress('');
      setPending(false);
    }
  }

  async function retry() {
    if (!created || !failed.length || pending) return;
    setPending(true); setError(''); setProgress('Retrying failed uploadsâ€¦');
    try {
      const remaining = await uploadColorwayMedia(created, [], adminApi.upload, setProgress, failed);
      setFailed(remaining);
      if (remaining.length) { const message = `${remaining.length} image${remaining.length === 1 ? '' : 's'} still failed to upload. Product data remains saved.`; setError(message); toast.error(message); }
      else toast.success('All product images uploaded successfully.');
    } finally { setProgress(''); setPending(false); }
  }

  return <>
    <BlockingLoader visible={pending} title={created ? 'Uploading product imagesâ€¦' : 'Creating productâ€¦'} message={progress || 'Saving product and colorwaysâ€¦'} />
    <section className="mt-8 max-w-5xl panel bg-white"><h2 className="font-semibold">Sale pricing</h2><div className="mt-3 flex flex-wrap items-end gap-3"><label className="label">Apply sale to all colorways<input className="field" type="number" min="1" value={familySalePrice} onChange={(event)=>setFamilySalePrice(event.target.value)} /></label><button className="button secondary" type="button" onClick={()=>setColorways(items=>items.map(item=>({...item,salePrice:familySalePrice})))}>Apply to all</button></div><div className="mt-4 grid gap-3 sm:grid-cols-2">{colorways.map((colorway,index)=><label className="label" key={colorway.key}>{colorway.name||`Colorway ${index+1}`} sale price (optional)<input className="field" type="number" min="1" value={colorway.salePrice} onChange={(event)=>change(colorway.key,item=>({...item,salePrice:event.target.value}))} /></label>)}</div></section>
    <form className="mt-8 max-w-5xl space-y-8" onSubmit={submit} aria-busy={pending} inert={pending ? true : undefined}>
      <section className="panel bg-white"><p className="eyebrow">1 Â· Model information</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="label sm:col-span-2">Model name<input className="field" value={model} onChange={(event) => setModel(event.target.value)} required placeholder="Nike Air Force 101" /></label><label className="label">Brand (optional)<select className="field" name="brandId"><option value="">No brand</option>{brands.map((brand) => <option value={brand.id} key={brand.id}>{brand.name}</option>)}</select></label><label className="label">Gender<select className="field" name="gender"><option value="">Unspecified</option>{['WOMEN', 'MEN', 'UNISEX', 'KIDS'].map((value) => <option key={value}>{value}</option>)}</select></label><label className="label sm:col-span-2">Description (optional)<textarea className="field min-h-28" name="description" /></label></div></section>
      <section><p className="eyebrow">2 Â· Colorway products</p><div className="mt-5 space-y-5">{colorways.map((colorway, index) => <article className="panel bg-white" key={colorway.key}><div className="flex flex-wrap items-end gap-3"><label className="label min-w-52 flex-1">Color<input className="field" list="catalog-colors" value={colorway.name} onChange={(event) => change(colorway.key, (item) => ({ ...item, name: event.target.value }))} /></label><input className="h-12 w-16" aria-label="Color swatch" type="color" value={colorway.hex} onChange={(event) => change(colorway.key, (item) => ({ ...item, hex: event.target.value }))} /><label className="label min-w-40">Price (BDT)<input className="field" type="number" min="0" value={colorway.price} onChange={(event) => change(colorway.key, (item) => ({ ...item, price: event.target.value }))} /></label>{colorways.length > 1 && <button className="button secondary" type="button" onClick={() => setColorways((items) => items.filter((item) => item.key !== colorway.key))}>Remove</button>}</div><datalist id="catalog-colors">{colors.map((color) => <option key={color.id} value={color.name} />)}</datalist><div className="mt-4 rounded bg-[var(--soft)] p-3 text-sm"><strong>{model && colorway.name ? `${model.trim()} | ${colorway.name.trim()}` : 'Generated after model and color'}</strong><span className="mt-1 block muted">/{familySlug && colorway.name ? `${familySlug}-${slugify(colorway.name)}` : 'â€”'}</span></div><label className="label mt-4">Images for {colorway.name || 'this colorway'}<input className="field" type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(event) => change(colorway.key, (item) => ({ ...item, images: Array.from(event.target.files ?? []) }))} /></label>{colorway.images.length > 0 && <p className="mt-2 text-xs muted">{colorway.images.map((file) => file.name).join(', ')}</p>}<p className="mt-5 text-sm font-semibold">EU sizes & stock</p><div className="mt-2 flex flex-wrap gap-2">{Array.from({ length: 11 }, (_, offset) => 36 + offset).map((eu) => <button className={`h-10 w-11 border ${colorway.sizes.some((size) => size.eu === eu) ? 'bg-black text-white' : ''}`} type="button" key={eu} onClick={() => toggleSize(colorway.key, eu)}>{eu}</button>)}</div>{index > 0 && <button className="mt-3 text-sm underline" type="button" onClick={() => change(colorway.key, (item) => ({ ...item, sizes: colorways[0]!.sizes.map((size) => ({ ...size, stock: 0 })) }))}>Copy sizes from {colorways[0]!.name || 'first colorway'} (stock starts at 0)</button>}<div className="mt-4 space-y-2">{colorway.sizes.map((size) => <div className="grid grid-cols-2 items-end gap-2 sm:grid-cols-[4rem_1fr_1fr_1fr]" key={size.eu}><strong className="pb-3">EU {size.eu}</strong><label className="label">UK<input className="field" type="number" min="0" step="0.5" value={size.uk} onChange={(event) => updateSize(colorway.key, size.eu, 'uk', event.target.value)} /></label><label className="label">US<input className="field" type="number" min="0" step="0.5" value={size.us} onChange={(event) => updateSize(colorway.key, size.eu, 'us', event.target.value)} /></label><label className="label">Stock<input className="field" type="number" min="0" value={size.stock} onChange={(event) => updateSize(colorway.key, size.eu, 'stock', event.target.value)} /></label></div>)}</div></article>)}</div><button className="button secondary mt-4" type="button" onClick={() => setColorways((items) => [...items, fresh()])}>+ Add another colorway</button></section>
      <section className="panel bg-white"><div className="flex flex-wrap justify-between gap-4"><p><strong>{colorways.length}</strong> products Â· <strong>{totals.variants}</strong> size SKUs Â· <strong>{totals.stock}</strong> units</p><label><input type="checkbox" name="published" /> Publish all colorways</label></div></section>
      {error && <div className="panel border-red-200 bg-red-50 text-red-800" role="alert"><p>{error}</p>{created && <div className="mt-4 flex gap-2">{failed.length > 0 && <button className="button" type="button" disabled={pending} onClick={() => void retry()}>Retry failed uploads</button>}<button className="button secondary" type="button" onClick={() => router.push(`/admin/products/${created.products[0]!.id}`)}>Open product</button></div>}</div>}
      <div className="sticky bottom-0 flex justify-end border-t bg-white/95 py-4">{!created && <button className="button" disabled={pending}>Save product model</button>}{created && !failed.length && <button className="button" type="button" onClick={() => router.push(`/admin/products/${created.products[0]!.id}`)}>Open product</button>}</div>
    </form>
  </>;
}
