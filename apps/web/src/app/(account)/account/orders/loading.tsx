import {OrderTableSkeleton} from '@/components/ui/page-skeletons';
import React from 'react';
export default function Loading(){return <section className="container page" aria-busy="true"><div className="skeleton h-2.5 w-20"/><div className="skeleton mt-4 h-9 w-36"/><div className="mt-9"><OrderTableSkeleton/></div></section>}
