import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function POST(request:Request){
  const session=await auth.api.getSession({headers:request.headers});
  if(!session||!['MANAGER','SUPER_ADMIN'].includes(session.user.role as string))return NextResponse.json({message:'Unauthorized'},{status:403});
  for(const tag of ['catalog','homepage-products','new-arrivals','related-products'])revalidateTag(tag);
  revalidatePath('/','page');
  revalidatePath('/products','page');
  revalidatePath('/product/[slug]','page');
  revalidatePath('/brand/[...slug]','page');
  return new NextResponse(null,{status:204});
}
