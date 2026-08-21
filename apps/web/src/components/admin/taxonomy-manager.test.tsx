import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { adminApi } from '@/lib/admin-api';
import { TaxonomyManager } from './taxonomy-manager';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('TaxonomyManager brand creation', () => {
  it('blocks duplicate submission and clears the controlled input after success', async () => {
    let finish!: (value: { id: string; name: string; slug: string; isActive: boolean }) => void;
    const pending = new Promise<{ id: string; name: string; slug: string; isActive: boolean }>((resolve) => { finish = resolve; });
    const create = vi.spyOn(adminApi, 'taxonomy').mockReturnValue(pending);
    render(<TaxonomyManager kind="brands" initial={[]} />);

    const input = screen.getByRole('textbox', { name: 'Name' });
    fireEvent.change(input, { target: { value: 'Nike' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    expect(await screen.findByRole('status', { name: 'Creating brand…' })).toBeTruthy();
    expect(input.hasAttribute('disabled')).toBe(true);
    expect(create).toHaveBeenCalledTimes(1);
    fireEvent.submit(input.closest('form')!);
    expect(create).toHaveBeenCalledTimes(1);

    finish({ id: 'nike', name: 'Nike', slug: 'nike', isActive: true });
    expect(await screen.findByText('Nike created.')).toBeTruthy();
    expect((input as HTMLInputElement).value).toBe('');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows the API conflict message and preserves the entered name', async () => {
    vi.spyOn(adminApi, 'taxonomy').mockRejectedValue(new Error('A brand with this name already exists.'));
    render(<TaxonomyManager kind="brands" initial={[]} />);
    const input = screen.getByRole('textbox', { name: 'Name' });
    fireEvent.change(input, { target: { value: 'Nike' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    expect((await screen.findByRole('alert')).textContent).toBe('A brand with this name already exists.');
    expect((input as HTMLInputElement).value).toBe('Nike');
  });
});
