import type {ProductListResponse} from '@footwear/shared';
import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import {afterEach,describe,expect,it,vi} from 'vitest';
import React from 'react';
import {HomeProductShelf} from './home-product-shelf';
type Product=ProductListResponse['data'][number];
function product(id:string):Product{return{id,title:id,slug:`shoe-${id}`,family:{id:'shared-family',name:`Model ${id}`,slug:'model'},color:{id,name:id,slug:id,hex:'#000'},description:'',basePrice:3500,effectivePriceFrom:3500,primaryImageUrl:`https://example.com/${id}.jpg`,brand:null,gender:'MEN',material:null,soleType:null,heelType:null,isActive:true,isAvailable:true,createdAt:'2026-08-15T00:00:00.000Z'}}
afterEach(cleanup);
describe('HomeProductShelf',()=>{it('renders every supplied colorway on its product route',()=>{render(<HomeProductShelf products={[product('black'),product('blue')]}/>);expect(screen.getByRole('link',{name:/model black/i}).getAttribute('href')).toBe('/product/shoe-black');expect(screen.getByRole('link',{name:/model blue/i}).getAttribute('href')).toBe('/product/shoe-blue')});it('provides accessible horizontal controls',()=>{const scrollBy=vi.fn();Element.prototype.scrollBy=scrollBy;render(<HomeProductShelf products={[product('a'),product('b')]}/>);fireEvent.click(screen.getByRole('button',{name:'Next new arrivals'}));expect(scrollBy).toHaveBeenCalled()});it('renders a compact empty state',()=>{render(<HomeProductShelf products={[]}/>);expect(screen.getByText('No footwear available yet.')).toBeTruthy();expect(screen.queryByTestId('home-product-carousel')).toBeNull()})});
