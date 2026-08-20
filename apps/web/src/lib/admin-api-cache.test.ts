import { afterEach, describe, expect, it, vi } from 'vitest';
import { adminApi } from './admin-api';

afterEach(()=>vi.unstubAllGlobals());
describe('admin catalog cache invalidation',()=>{
  it('starts one centralized storefront invalidation after a successful mutation',async()=>{
    const brand={id:'brand-1',name:'RAQI',slug:'raqi',isActive:true};
    const fetchMock=vi.fn().mockResolvedValueOnce(new Response(JSON.stringify(brand),{status:200,headers:{'Content-Type':'application/json'}})).mockResolvedValueOnce(new Response(null,{status:204}));
    vi.stubGlobal('fetch',fetchMock);
    await adminApi.taxonomy('brands',{name:'RAQI',slug:'raqi',isActive:true});
    await vi.waitFor(()=>expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock.mock.calls[1]?.[0]).toBe('/api/storefront-cache');
    expect(fetchMock.mock.calls[1]?.[1]).toMatchObject({method:'POST',credentials:'include',keepalive:true});
  });
  it('does not invalidate after a rejected mutation',async()=>{
    const fetchMock=vi.fn().mockResolvedValue(new Response(JSON.stringify({message:'Conflict'}),{status:409,headers:{'Content-Type':'application/json'}}));
    vi.stubGlobal('fetch',fetchMock);
    await expect(adminApi.taxonomy('brands',{name:'RAQI'})).rejects.toThrow('Conflict');
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
