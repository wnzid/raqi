const sections = new Set(['orders', 'addresses', 'wishlist', 'returns']);
export default async function AccountSectionPage({ params }: { params: Promise<{ section: string }> }) { const { section } = await params; return <h1 className="text-2xl font-semibold">{sections.has(section) ? section : 'Account'}</h1>; }
