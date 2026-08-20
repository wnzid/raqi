'use client';

import React, { useEffect } from 'react';

export function BlockingLoader({ visible, title, message, progress }: { visible: boolean; title: string; message?: string; progress?: { completed: number; total: number } }) {
  useEffect(() => {
    if (!visible) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [visible]);

  if (!visible) return null;
  const percent = progress && progress.total > 0 ? Math.min(100, Math.round((progress.completed / progress.total) * 100)) : null;
  return <div className="fixed inset-0 z-[200] grid cursor-wait place-items-center bg-white/95 p-6" role="status" aria-live="polite" aria-busy="true" aria-label={title}>
    <div className="w-full max-w-sm text-center">
      <span className="mx-auto block h-9 w-9 animate-spin rounded-full border-2 border-neutral-300 border-t-black" aria-hidden="true" />
      <h2 className="mt-6 text-xl font-semibold">{title}</h2>
      {message && <p className="mt-3 text-sm muted">{message}</p>}
      {progress && progress.total > 0 && <div className="mt-5" aria-label={`${progress.completed} of ${progress.total} completed`}>
        <div className="h-1.5 overflow-hidden rounded-full bg-neutral-200"><div className="h-full bg-black transition-[width] duration-200" style={{ width: `${percent}%` }} /></div>
        <p className="mt-2 text-xs muted">{progress.completed} of {progress.total} images uploaded</p>
      </div>}
      <p className="mt-5 text-xs uppercase tracking-[0.18em] text-neutral-500">Please wait</p>
    </div>
  </div>;
}
