import { notFound } from 'next/navigation';
import { ApiError, getProduct } from '@/lib/api-client';
import { AddToCart } from '@/components/cart/add-to-cart';
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; try { const product = await getProduct(slug); return <article><h1 className="text-2xl font-semibold">{product.title}</h1><p className="mt-2">From {product.effectivePriceFrom.toFixed(2)}</p><p className="mt-2 text-neutral-600">{product.description}</p><AddToCart variants={product.variants} /></article>; } catch (error) { if (error instanceof ApiError && error.status === 404) notFound(); throw error; } }
