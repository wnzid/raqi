'use client';
import React, { useEffect } from 'react';
export default function ErrorState({ error, reset }: { error: Error; reset: () => void }) { useEffect(() => { console.error(error); }, [error]); return <section className="border border-[var(--line)] bg-white p-8"><p className="eyebrow">Fulfillment</p><h1 className="mt-3 text-xl font-semibold">Orders could not be loaded</h1><p className="mt-2 text-sm muted">Please retry. Existing orders and fulfillment state have not been changed.</p><button className="button mt-5" onClick={reset}>Try again</button></section>; }
