import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { adminApi, type AdminProduct } from '@/lib/admin-api';
import { MediaManager } from './media-manager';
import { AdminToastProvider } from './toast';

const refresh = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }));
vi.mock('next/image', () => ({ default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} /> }));
afterEach(() => { cleanup(); vi.restoreAllMocks(); refresh.mockClear(); });

describe('MediaManager primary image', () => {
  it('normalizes the selected image to position zero', async () => {
    const media = [
      { id: 'first', objectKey: 'first', url: '/first.webp', position: 0, isPrimary: true },
      { id: 'second', objectKey: 'second', url: '/second.webp', position: 1, isPrimary: false },
      { id: 'third', objectKey: 'third', url: '/third.webp', position: 2, isPrimary: false },
    ] as AdminProduct['media'];
    const reorder = vi.spyOn(adminApi, 'reorderMedia').mockResolvedValue({ updated: 3 });
    render(<AdminToastProvider><MediaManager productId="product" media={media} /></AdminToastProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Set image 3 as primary' }));
    await waitFor(() => expect(reorder).toHaveBeenCalledWith('product', [
      { id: 'third', position: 0 }, { id: 'first', position: 1 }, { id: 'second', position: 2 },
    ]));
    expect(refresh).toHaveBeenCalled();
  });
});
