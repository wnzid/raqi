import {headers} from 'next/headers';
import Link from 'next/link';
import {ProductList} from '@/components/admin/product-list';
import {adminApi} from '@/lib/admin-api';

export default async function Page(){
  const h=await headers(),[products,total]=await adminApi.products({headers:{cookie:h.get('cookie')??''}}),newArrivals=products.filter(product=>product.isNewArrival);
  return <section><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Catalog</p><h1 className="title mt-3">Product models</h1><p className="mt-2 muted">{new Set(products.map(product=>product.family.id)).size} models · {total} colorway products</p></div><Link className="button" href="/admin/products/new">Add product model</Link></div>{newArrivals.length>0&&<div className="mt-5 flex flex-wrap gap-2" aria-label="New arrival colorways">{newArrivals.map(product=><Link className="status" href={`/admin/products/${product.id}`} key={product.id}>{product.family.name} · {product.color.name} · New arrival</Link>)}</div>}<ProductList products={products}/></section>;
}
