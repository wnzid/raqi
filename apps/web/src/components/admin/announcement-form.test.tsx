import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { announcementAdminApi } from '@/lib/admin-api';
import { AnnouncementForm } from './announcement-form';
import { AdminToastProvider } from './toast';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });
describe('AnnouncementForm', () => {
  it('saves message, enabled state, and schedule with toast feedback', async () => {
    const update = vi.spyOn(announcementAdminApi, 'update').mockResolvedValue({ id: 'storefront', message: 'Sale', backgroundColor:'#000000', isEnabled: true, startsAt: null, endsAt: null, link: null, updatedAt: new Date().toISOString() });
    render(<AdminToastProvider><AnnouncementForm initial={{ id: 'storefront', message: '', backgroundColor:'#D71920', isEnabled: false, startsAt: null, endsAt: null, link: null, updatedAt: null }} /></AdminToastProvider>);
    fireEvent.click(screen.getByRole('checkbox', { name: /active/i }));
    fireEvent.change(screen.getByRole('textbox', { name: /^Message/ }), { target: { value: 'EID SALE: 30% OFF' } });
    fireEvent.change(screen.getByLabelText('Starts (optional)'), { target: { value: '2026-08-20T00:00' } });
    fireEvent.change(screen.getByLabelText('Ends (optional)'), { target: { value: '2026-08-31T23:59' } });
    fireEvent.change(screen.getByLabelText('Banner color hex'),{target:{value:'#000000'}});
    fireEvent.click(screen.getByRole('button', { name: 'Save announcement' }));
    await waitFor(() => expect(update).toHaveBeenCalled());
    expect(update.mock.calls[0]?.[0]).toMatchObject({ message: 'EID SALE: 30% OFF', backgroundColor:'#000000', isEnabled: true });
    expect(await screen.findByText('Announcement updated.')).toBeTruthy();
  });
});
