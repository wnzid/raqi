'use client';
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <section><h1 className="text-2xl font-semibold">Something went wrong</h1><p className="mt-2 text-neutral-600">Please try again.</p><button className="mt-4 rounded bg-black px-4 py-2 text-white" onClick={reset}>Try again</button></section>; }
