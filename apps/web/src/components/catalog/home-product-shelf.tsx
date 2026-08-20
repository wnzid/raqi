'use client';
import type {ProductListResponse} from '@footwear/shared';
import {ArrowLeft,ArrowRight} from 'lucide-react';
import Link from 'next/link';
import React,{useCallback,useEffect,useRef,useState} from 'react';
import {ProductCard} from './product-card';
type Product=ProductListResponse['data'][number];

export function HomeProductShelf({products,title='New arrivals',autoPlay=true,viewAllHref='/products'}:{products:Product[];title?:string;autoPlay?:boolean;viewAllHref?:string}){
  const rail=useRef<HTMLDivElement>(null),[paused,setPaused]=useState(false);
  const move=useCallback((direction:-1|1)=>{const node=rail.current;if(node)node.scrollBy({left:direction*Math.max(240,node.clientWidth*.72),behavior:'smooth'})},[]);
  useEffect(()=>{if(!autoPlay||paused||products.length<2||(typeof window.matchMedia==='function'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches))return;const timer=window.setInterval(()=>{const node=rail.current;if(!node)return;if(node.scrollLeft+node.clientWidth>=node.scrollWidth-8)node.scrollTo({left:0,behavior:'smooth'});else move(1)},4500);return()=>window.clearInterval(timer)},[autoPlay,move,paused,products.length]);
  const id=title.toLowerCase().replaceAll(' ','-');
  return <section className="home-section container" aria-labelledby={id}><div className="home-section-heading"><h2 id={id}>{title}</h2><div className="flex items-center gap-2"><Link className="home-view-all" href={viewAllHref}>View all <ArrowRight size={14}/></Link>{products.length>1&&<><button className="shelf-arrow" type="button" aria-label={`Previous ${title.toLowerCase()}`} onClick={()=>move(-1)}><ArrowLeft size={17}/></button><button className="shelf-arrow" type="button" aria-label={`Next ${title.toLowerCase()}`} onClick={()=>move(1)}><ArrowRight size={17}/></button></>}</div></div>{products.length?<div ref={rail} className="home-product-rail" data-testid="home-product-carousel" tabIndex={0} aria-label={`${title} product carousel`} onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)} onFocus={()=>setPaused(true)} onBlur={()=>setPaused(false)}>{products.map(product=><ProductCard product={product} key={product.id}/>)}</div>:<div className="py-12 text-center"><p className="text-sm font-medium">No footwear available yet.</p><p className="mt-1 text-sm muted">Please check back soon.</p></div>}</section>;
}
