import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AdminNavigation } from './admin-navigation';

let pathname = '/admin';
vi.mock('next/navigation', () => ({ usePathname: () => pathname }));

afterEach(() => { cleanup(); pathname = '/admin'; document.body.style.overflow = ''; });

describe('AdminNavigation', () => {
  it('groups all existing manager routes and marks the current route with more than text color', () => {
    pathname = '/admin/orders/RAQI-1';
    render(<AdminNavigation superAdmin={false} />);
    expect(screen.getByText('MAIN')).toBeTruthy();
    expect(screen.getByText('CATALOG')).toBeTruthy();
    expect(screen.getByText('STORE')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Orders' }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('link', { name: 'Orders' }).className).toContain('border-white');
    expect(screen.getByRole('link', { name: 'Announcements' }).getAttribute('href')).toBe('/admin/announcement');
    expect(screen.queryByRole('link', { name: 'Users' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Activity' })).toBeNull();
  });

  it('shows restricted management links only to super admins', () => {
    render(<AdminNavigation superAdmin />);
    expect(screen.getByText('MANAGEMENT')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Users' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Activity' })).toBeTruthy();
  });

  it('uses the same grouped navigation inside the responsive drawer', () => {
    render(<AdminNavigation superAdmin={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Open admin menu' }));
    expect(screen.getByRole('dialog', { name: 'Admin menu' })).toBeTruthy();
    expect(screen.getAllByText('MAIN')).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: 'View storefront' })).toHaveLength(2);
  });
});
