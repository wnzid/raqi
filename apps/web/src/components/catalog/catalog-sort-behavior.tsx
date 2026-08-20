'use client';
import React,{useEffect,useRef} from 'react';

export function CatalogSortBehavior(){
  const marker=useRef<HTMLSpanElement>(null);
  useEffect(()=>{const form=marker.current?.closest('form'),select=form?.querySelector<HTMLSelectElement>('select[name="sort"]');if(!form||!select)return;const submit=()=>form.requestSubmit();select.addEventListener('change',submit);return()=>select.removeEventListener('change',submit)},[]);
  return <span className="hidden" ref={marker}/>;
}
