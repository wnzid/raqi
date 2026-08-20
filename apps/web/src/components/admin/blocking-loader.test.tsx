import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { BlockingLoader } from './blocking-loader';

afterEach(() => { cleanup(); document.body.style.overflow = ''; });

describe('BlockingLoader', () => {
  it('blocks the viewport, reports progress, and locks scrolling', () => {
    render(<BlockingLoader visible title="Creating product" message="Uploading Blue images 2 / 4" progress={{ completed: 2, total: 4 }} />);
    expect(screen.getByRole('status', { name: 'Creating product' })).toBeTruthy();
    expect(screen.getByText('Uploading Blue images 2 / 4')).toBeTruthy();
    expect(screen.getByText('2 of 4 images uploaded')).toBeTruthy();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores scrolling when hidden', () => {
    const view = render(<BlockingLoader visible title="Saving" />);
    view.rerender(<BlockingLoader visible={false} title="Saving" />);
    expect(screen.queryByRole('status')).toBeNull();
    expect(document.body.style.overflow).toBe('');
  });
});
