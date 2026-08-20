import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { adminApi } from '@/lib/admin-api';
import { ProductForm } from './product-form';
import { AdminToastProvider } from './toast';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));
afterEach(() => { cleanup(); vi.restoreAllMocks(); document.body.style.overflow = ''; });
const brands = [{ id: 'brand', name: 'Running', slug: 'running', isActive: true }];
const colors = [{ id: 'black', name: 'Black', slug: 'black', hex: '#000000', isActive: true }];
const created = { family: { id: 'family', name: 'Runner' }, products: [{ id: 'product', colorId: 'black', slug: 'runner-black', title: 'Runner | Black' }] };
const deferred = <T,>() => { let resolve!: (value: T) => void; let reject!: (reason?: unknown) => void; const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };

function setup(file?: File,selectBrand=true) {
  render(<AdminToastProvider><ProductForm brands={brands} colors={colors} /></AdminToastProvider>);
  fireEvent.change(screen.getByPlaceholderText('Nike Air Force 101'), { target: { value: 'Runner' } });
  if(selectBrand)fireEvent.change(screen.getByRole('combobox', { name: 'Brand (optional)' }), { target: { value: 'brand' } });
  fireEvent.change(screen.getByRole('combobox', { name: 'Color' }), { target: { value: 'Black' } });
  fireEvent.change(screen.getByRole('spinbutton', { name: 'Price (BDT)' }), { target: { value: '4990' } });
  fireEvent.click(screen.getByRole('button', { name: '36' }));
  if (file) fireEvent.change(screen.getByLabelText('Images for Black'), { target: { files: [file] } });
}

describe('ProductForm blocking workflow', () => {
  it('submits a product family without a brand',async()=>{const create=vi.spyOn(adminApi,'createFamily').mockResolvedValue(created);setup(undefined,false);fireEvent.click(screen.getByRole('button',{name:'Save product model'}));await screen.findByText('Product created successfully.');expect(create).toHaveBeenCalledWith(expect.objectContaining({brandId:null}))});
  it('blocks immediately and closes with a success toast', async () => {
    const creation = deferred<typeof created>();
    vi.spyOn(adminApi, 'createFamily').mockReturnValue(creation.promise);
    setup(); fireEvent.click(screen.getByRole('button', { name: 'Save product model' }));
    expect(await screen.findByRole('status', { name: 'Creating productâ€¦' })).toBeTruthy();
    expect(document.querySelector('form')?.hasAttribute('inert')).toBe(true);
    creation.resolve(created);
    expect(await screen.findByText('Product created successfully.')).toBeTruthy();
    await waitFor(() => expect(screen.queryByRole('status', { name: 'Creating productâ€¦' })).toBeNull());
    expect(document.querySelector('form')?.hasAttribute('inert')).toBe(false);
  });

  it('unblocks the form after a database failure', async () => {
    vi.spyOn(adminApi, 'createFamily').mockRejectedValue(new Error('Could not create product.'));
    setup(); fireEvent.click(screen.getByRole('button', { name: 'Save product model' }));
    expect((await screen.findAllByText('Could not create product.')).length).toBeGreaterThan(0);
    await waitFor(() => expect(screen.queryByRole('status', { name: 'Creating productâ€¦' })).toBeNull());
    expect(screen.getByRole('button', { name: 'Save product model' }).hasAttribute('disabled')).toBe(false);
  });

  it('preserves failed media and retries without recreating the family', async () => {
    const retry = deferred<unknown>();
    const create = vi.spyOn(adminApi, 'createFamily').mockResolvedValue(created);
    const upload = vi.spyOn(adminApi, 'upload').mockRejectedValueOnce(new Error('upload failed')).mockReturnValueOnce(retry.promise as never);
    setup(new File(['image'], 'black.webp', { type: 'image/webp' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save product model' }));
    const retryButton = await screen.findByRole('button', { name: 'Retry failed uploads' });
    fireEvent.click(retryButton);
    expect(await screen.findByRole('status', { name: 'Uploading product imagesâ€¦' })).toBeTruthy();
    expect(create).toHaveBeenCalledTimes(1); expect(upload).toHaveBeenCalledTimes(2);
    retry.resolve({});
    expect(await screen.findByText('All product images uploaded successfully.')).toBeTruthy();
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Retry failed uploads' })).toBeNull());
  });
});
