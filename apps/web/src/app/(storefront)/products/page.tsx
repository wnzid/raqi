import {CatalogView} from '@/components/catalog/catalog-view';
import {listProducts} from '@/lib/api-client';

export default async function ProductsPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
  const raw=await searchParams,params=Object.fromEntries(Object.entries(raw).filter((entry):entry is [string,string]=>typeof entry[1]==='string')),newArrivals=params.newArrival==='true',gender=params.gender==='MEN'?'Men':params.gender==='WOMEN'?'Women':null,title=newArrivals?'New arrivals':gender??(params.q?`Search: ${params.q}`:'All footwear');
  try{const result=await listProducts(params);return <CatalogView result={result} params={params} title={title} breadcrumbs={[{label:'Home',href:'/'},{label:title}]}/>}
  catch{return <section className="container page"><p className="eyebrow">Shop RAQI</p><h1 className="title mt-4">{newArrivals?'New arrivals':'All footwear'}</h1><div className="panel mt-8"><h2 className="font-semibold">We couldn’t load the collection.</h2><p className="mt-2 muted">Please try again in a moment.</p></div></section>}
}
