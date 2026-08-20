import type {ProductListResponse} from '@footwear/shared';
import {cleanup,render,screen} from '@testing-library/react';
import React from 'react';
import {afterEach,describe,expect,it} from 'vitest';
import {CatalogView} from './catalog-view';

afterEach(cleanup);
const colorway=(id:string,color:string,slug:string,image:string):ProductListResponse['data'][number]=>({id,title:`Runner ${color}`,slug,family:{id:'runner-family',name:'Runner',slug:'runner'},color:{id:color.toLowerCase(),name:color,slug:color.toLowerCase(),hex:'#000'},description:'',basePrice:3500,effectivePriceFrom:3500,primaryImageUrl:image,brand:null,gender:'MEN',material:null,soleType:null,heelType:null,isActive:true,isAvailable:true,createdAt:'2026-08-15T00:00:00.000Z'});

describe('CatalogView',()=>{it('renders every visible colorway as its own linked product card',()=>{const result:ProductListResponse={data:[colorway('black','Black','runner-black','https://example.com/black.jpg'),colorway('grey','Grey','runner-grey','https://example.com/grey.jpg'),colorway('blue','Blue','runner-blue','https://example.com/blue.jpg')],pagination:{page:1,pageSize:24,total:3,totalPages:1}};const {container}=render(<CatalogView result={result}/>);expect(container.querySelectorAll('.product-grid article')).toHaveLength(3);expect(screen.getByText('3 products')).toBeTruthy();for(const [color,slug,image] of [['Black','runner-black','black.jpg'],['Grey','runner-grey','grey.jpg'],['Blue','runner-blue','blue.jpg']]){const label=screen.getByText(`Men · ${color}`);const link=label.closest('a');expect(link?.getAttribute('href')).toBe(`/product/${slug}`);expect(link?.querySelector('.product-image')?.getAttribute('style')).toContain(image)}})});
