import type {ProductListResponse} from '@footwear/shared';
import React from 'react';
import {cleanup,render,screen} from '@testing-library/react';
import {afterEach,describe,expect,it} from 'vitest';
import {ProductCard} from './product-card';
afterEach(cleanup);
describe('ProductCard',()=>{it('uses the family model, primary summary image, price, and normal detail route',()=>{const product={id:'colorway',title:'Runner Black',slug:'runner-black',family:{id:'family',name:'Runner',slug:'runner'},color:{id:'black',name:'Black',slug:'black',hex:'#000'},description:'',basePrice:3500,effectivePriceFrom:3500,primaryImageUrl:'https://example.com/primary.jpg',brand:null,gender:'MEN',material:null,soleType:null,heelType:null,isActive:true,isAvailable:true,createdAt:'2026-08-15T00:00:00.000Z'} satisfies ProductListResponse['data'][number];render(<ProductCard product={product}/>);const link=screen.getByRole('link');expect(link.getAttribute('href')).toBe('/product/runner-black');expect(screen.getByRole('heading',{name:'Runner'})).toBeTruthy();expect(screen.getByText(/3,500/)).toBeTruthy();expect(link.querySelector('.product-image')?.getAttribute('style')).toContain('primary.jpg')})});
