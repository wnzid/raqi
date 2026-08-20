'use client';

import React, { type FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminProduct, Taxonomy } from '@/lib/admin-api';
import { adminApi } from '@/lib/admin-api';
import { useAdminToast } from './toast';
import { BlockingLoader } from './blocking-loader';

export function ProductEditor({ product, brands }: { product: AdminProduct; brands: Taxonomy[] }) {
  const router = useRouter();
  const toast = useAdminToast();
  const [pending, setPending] = useState(false);
  const [validation, setValidation] = useState('');

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const brandId = String(data.get('brandId'));
    const basePrice = Number(data.get('basePrice'));
    const salePrice = data.get('salePrice') === '' ? null : Number(data.get('salePrice'));
    if (salePrice != null && (salePrice <= 0 || salePrice >= basePrice)) {
      setValidation('Sale price must be greater than zero and lower than the regular price.');
      return;
    }
    if (brandId && !brands.some((item) => item.id === brandId && item.isActive)) {
      setValidation('This brand is no longer available. Please select another brand.');
      return;
    }
    setValidation('');
    setPending(true);
    try {
      await adminApi.updateFamily(product.family.id, { name: String(data.get('name')) });
      await adminApi.updateProduct(product.id, {
        description: String(data.get('description') ?? ''),
        basePrice,
        salePrice,
        brandId: brandId || null,
        gender: data.get('gender') || null,
        isActive: data.get('isActive') === 'on',
        isNewArrival: data.get('isNewArrival') === 'on',
        publishedAt: data.get('isActive') === 'on' ? (product.publishedAt ?? new Date().toISOString()) : null,
      });
      toast.success('Product updated successfully.');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save product.');
    } finally {
      setPending(false);
    }
  }

  return <><BlockingLoader visible={pending} title="Saving product changesâ€¦" message="Updating product details and storefront URL." /><form className="panel bg-white" onSubmit={save} aria-busy={pending} inert={pending ? true : undefined}>
    <h2 className="text-lg font-semibold">General details and availability</h2>
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      <label className="label">Model name<input className="field" name="name" defaultValue={product.family.name} required /></label>
      <label className="label">Price (BDT)<input className="field" name="basePrice" type="number" min="0" defaultValue={Number(product.basePrice)} required /></label>
      <label className="label">Sale price (BDT, optional)<input className="field" name="salePrice" type="number" min="1" defaultValue={product.salePrice == null ? '' : Number(product.salePrice)} /><span className="mt-1 block text-xs muted">Clear this field to end the sale.</span></label>
      <div className="rounded bg-[var(--soft)] p-3 text-sm sm:col-span-2"><span className="label">Store URL</span><span className="mt-1 block muted">/product/{product.slug}</span><span className="mt-1 block text-xs muted">Generated automatically from the model and color.</span></div>
      <label className="label">Brand (optional)<select className="field" name="brandId" defaultValue={product.brand?.id ?? ''}><option value="">No brand</option>{brands.map((item) => <option key={item.id} value={item.id} disabled={!item.isActive}>{item.name}{!item.isActive ? ' (inactive)' : ''}</option>)}</select>{validation && <span className="mt-1 block text-sm text-red-700">{validation}</span>}</label>
      <label className="label">Gender<select className="field" name="gender" defaultValue={product.gender ?? ''}><option value="">Unspecified</option>{['WOMEN', 'MEN', 'UNISEX', 'KIDS'].map((value) => <option key={value}>{value}</option>)}</select></label>
      <label className="label sm:col-span-2">Description (optional)<textarea className="field min-h-28" name="description" defaultValue={product.description} /></label>
      <label className="sm:col-span-2"><input type="checkbox" name="isActive" defaultChecked={product.isActive} /> Active and available to publish</label>
      <label className="sm:col-span-2"><input type="checkbox" name="isNewArrival" defaultChecked={product.isNewArrival} /> Show in New Arrivals</label>
    </div>
    <button className="button mt-5" disabled={pending}>{pending ? 'Savingâ€¦' : 'Save details'}</button>
  </form></>;
}

export function VariantEditor({ product }: { product: AdminProduct }) {
  const router = useRouter();
  const toast = useAdminToast();
  async function add() {
    const existing = new Set(product.variants.map((item) => Number(item.sizeEu)));
    const size = Array.from({ length: 20 }, (_, index) => 30 + index).find((value) => !existing.has(value));
    if (!size) { toast.error('No unused EU size is available.'); return; }
    try {
      await adminApi.createVariant(product.id, { sku: `${product.slug.toUpperCase()}-${size}`, colorId: product.color.id, sizeEu: size, sizeUk: null, sizeUs: null, stockQuantity: 0, isActive: true });
      toast.success(`EU ${size} added.`);
      router.refresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not add size.'); }
  }
  return <div className="panel bg-white"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold">EU sizes & inventory</h2><button className="button secondary" type="button" onClick={() => void add()}>+ Add size</button></div><div className="mt-5 space-y-2">{product.variants.map((variant) => <div className="grid grid-cols-[5rem_1fr_auto] items-end gap-3 border-b py-3" key={variant.id}><label className="label">EU Size<input className="field" type="number" defaultValue={Number(variant.sizeEu)} onBlur={async (event) => { try { await adminApi.updateVariant(product.id, variant.id, { sizeEu: Number(event.target.value) }); toast.success(`${variant.sku} size updated.`); } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not update size.'); } }} /></label><label className="label">Stock<input className="field" type="number" min="0" step="1" defaultValue={variant.stockQuantity} onBlur={async (event) => { try { await adminApi.updateInventory(variant.id, Number(event.target.value)); toast.success(`${variant.sku} stock updated.`); } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not update stock.'); } }} /></label><button className="button secondary" type="button" onClick={async () => { if (!confirm(`Remove EU ${variant.sizeEu}?`)) return; try { await adminApi.deleteVariant(product.id, variant.id); toast.success(`EU ${variant.sizeEu} removed.`); router.refresh(); } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not remove size.'); } }}>Remove</button></div>)}</div></div>;
}
