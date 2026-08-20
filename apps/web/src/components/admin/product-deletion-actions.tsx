'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminProduct } from '@/lib/admin-api';
import { adminApi } from '@/lib/admin-api';
import { BlockingLoader } from './blocking-loader';
import { useAdminToast } from './toast';

export function ProductDeletionActions({ product }: { product: AdminProduct }) {
  const router = useRouter();
  const toast = useAdminToast();
  const [pending, setPending] = useState(false);
  const count = product.family.products?.length ?? 1;

  async function removeFamily() {
    if (!confirm(`Permanently delete “${product.family.name}”?\n\nThis will delete all colorways, all EU-size variants, all stock and all product images. This action cannot be undone.`)) return;
    setPending(true);
    try {
      await adminApi.deleteFamily(product.family.id);
      toast.success('Product and all colorways permanently deleted.');
      router.push('/admin/products');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'The product could not be deleted.');
      setPending(false);
    }
  }

  async function removeColorway() {
    const final = count === 1;
    if (!confirm(final ? `This is the final colorway. Permanently deleting it will delete the entire “${product.family.name}” product, including all EU-size variants, stock and images. This action cannot be undone.` : `Permanently delete the ${product.color.name} colorway?\n\nThis will delete this colorway, its EU-size variants, stock and images. Other colorways will remain.`)) return;
    setPending(true);
    try {
      const result = await adminApi.deleteColorway(product.id);
      toast.success(result.familyDeleted ? 'Product and all colorways permanently deleted.' : 'Colorway permanently deleted.');
      router.push('/admin/products');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'The colorway could not be deleted.');
      setPending(false);
    }
  }

  return <>
    <BlockingLoader visible={pending} title="Permanently deleting product…" message="Removing product data and images." />
    <section className="panel border-red-300 bg-red-50" aria-busy={pending} inert={pending ? true : undefined}>
      <h2 className="text-lg font-semibold text-red-900">Permanent deletion</h2>
      <p className="mt-2 text-sm text-red-800">These operations remove PostgreSQL records and owned product images. They cannot be undone.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        {count > 1 && <button className="button secondary border-red-600 text-red-800" type="button" disabled={pending} onClick={() => void removeColorway()}>Delete {product.color.name} colorway permanently</button>}
        {count === 1 && <button className="button secondary border-red-600 text-red-800" type="button" disabled={pending} onClick={() => void removeColorway()}>Delete final colorway and product</button>}
        <button className="button bg-red-700" type="button" disabled={pending} onClick={() => void removeFamily()}>Delete product permanently</button>
      </div>
    </section>
  </>;
}
