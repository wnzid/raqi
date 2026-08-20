'use client';
import Link from 'next/link';
import Image from 'next/image';
import React,{useEffect,useState} from 'react';

export type HeroCandidate={id:string;url:string;slug:string;label:string};
const STORAGE_KEY='raqi:homepage-hero-media';
let documentSelection:string|null=null;

export function chooseHeroCandidate(candidates:HeroCandidate[],previousId:string|null,random=Math.random){
  if(!candidates.length)return null;
  const pool=candidates.length>1?candidates.filter(candidate=>candidate.id!==previousId):candidates;
  return pool[Math.min(pool.length-1,Math.floor(random()*pool.length))]??candidates[0]!;
}

function navigationType(){return (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming|undefined)?.type??'navigate'}

export function RandomHeroMedia({candidates}:{candidates:HeroCandidate[]}){
  const[selected,setSelected]=useState<HeroCandidate|null>(null),[ready,setReady]=useState(false),[failed,setFailed]=useState(false);
  useEffect(()=>{let stored:string|null=null;try{stored=sessionStorage.getItem(STORAGE_KEY)}catch{}const reusableId=documentSelection??(navigationType()==='back_forward'?stored:null),reusable=candidates.find(candidate=>candidate.id===reusableId),choice=reusable??chooseHeroCandidate(candidates,stored);documentSelection=choice?.id??null;if(choice)try{sessionStorage.setItem(STORAGE_KEY,choice.id)}catch{}setSelected(choice);setReady(false);setFailed(!choice)},[candidates]);
  useEffect(()=>{if(!selected)return;const preload=new window.Image();preload.onload=()=>setReady(true);preload.onerror=()=>setFailed(true);preload.src=selected.url;return()=>{preload.onload=null;preload.onerror=null}},[selected]);
  if(failed)return <HeroFallback/>;
  if(!selected||!ready)return <div className="hero-media-skeleton skeleton" aria-label="Loading featured product image"/>;
  return <><div className="hero-orbit"/><div className="hero-shoe hero-shoe-ghost" aria-hidden><Image className="hero-shoe-image" src={selected.url} alt="" fill sizes="(min-width: 768px) 55vw, 100vw"/></div><Link className="hero-shoe" href={`/product/${selected.slug}`} aria-label={`View ${selected.label}`}><Image className="hero-shoe-image" src={selected.url} alt={selected.label} fill priority sizes="(min-width: 768px) 55vw, 100vw" onError={()=>setFailed(true)}/></Link></>;
}

function HeroFallback(){return <div className="hero-fallback"><Image src="/favicon.ico?v=2" alt="RAQI" width={96} height={96} unoptimized/></div>}
