import { Facebook, Instagram } from 'lucide-react';
import Link from 'next/link';
import { raqiContact } from '@/lib/raqi-contact';

const groups: { title: string; links: Array<[string, string]> }[] = [
  { title: 'Shop', links: [['Shop all', '/products'], ['Men', '/products?gender=MEN'], ['Women', '/products?gender=WOMEN'], ['New arrivals', '/products?newArrival=true']] },
  { title: 'Your RAQI', links: [['Account', '/account'], ['Orders', '/account/orders'], ['Addresses', '/account/addresses'], ['Cart', '/cart']] },
];

export function Footer() {
  return <footer className="bg-[#171715] text-white"><div className="container grid gap-12 py-12 md:grid-cols-[1.1fr_2fr] md:py-16"><div><Link className="text-xl font-bold tracking-[.24em]" href="/">RAQI</Link><p className="mt-5 max-w-xs text-sm leading-6 text-neutral-400">Contemporary footwear for everyday movement. Designed for the rhythm of life in Bangladesh.</p><a className="mt-4 block break-all text-sm text-neutral-400 transition-colors hover:text-white" href={`mailto:${raqiContact.email}`}>{raqiContact.email}</a></div><div className="grid grid-cols-2 gap-9 sm:grid-cols-3">{groups.map((group) => <div key={group.title}><h2 className="text-[.68rem] font-bold uppercase tracking-[.15em] text-neutral-200">{group.title}</h2><ul className="mt-4 space-y-3 text-sm text-neutral-400">{group.links.map(([label, href]) => <li key={label}><Link className="transition-colors hover:text-white" href={href}>{label}</Link></li>)}</ul></div>)}<div><h2 className="text-[.68rem] font-bold uppercase tracking-[.15em] text-neutral-200">Follow RAQI</h2><div className="mt-4 flex gap-3"><a aria-label="RAQI Instagram" className="text-neutral-400 transition-colors hover:text-white" href={raqiContact.instagramUrl} rel="noopener noreferrer" target="_blank"><Instagram aria-hidden="true" size={21}/></a><a aria-label="RAQI Facebook" className="text-neutral-400 transition-colors hover:text-white" href={raqiContact.facebookUrl} rel="noopener noreferrer" target="_blank"><Facebook aria-hidden="true" size={21}/></a></div></div></div></div><div className="container flex flex-col gap-3 border-t border-white/15 py-5 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between"><span>© {new Date().getFullYear()} RAQI</span><span>Privacy · Terms</span></div></footer>;
}
