import {describe,expect,it,vi} from 'vitest';
import {ProductsService} from './products.service';

describe('ProductsService New Arrivals query',()=>{
  it('combines the admin flag with existing active and published visibility',async()=>{
    const findMany=vi.fn().mockResolvedValue([]),count=vi.fn().mockResolvedValue(0),prisma={product:{findMany,count},$transaction:vi.fn(async(values:Promise<unknown>[])=>Promise.all(values))};
    const service=new ProductsService(prisma as never,{write:vi.fn()} as never,{remove:vi.fn()} as never);
    await service.list({page:1,pageSize:24,sort:'newest',newArrival:true} as never);
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({where:expect.objectContaining({isNewArrival:true,isActive:true,publishedAt:{not:null}})}));
    expect(count).toHaveBeenCalledWith({where:expect.objectContaining({isNewArrival:true,isActive:true,publishedAt:{not:null}})});
  });
});
