import {describe,expect,it} from 'vitest';
import {updateAnnouncementSchema} from './announcement';
const base={message:'EID SALE: UP TO 30% OFF!',backgroundColor:'#D71920',isEnabled:true,startsAt:null,endsAt:null,link:null};
describe('announcement configuration',()=>{
  it('accepts normal punctuation, an internal link, and normalizes color',()=>expect(updateAnnouncementSchema.parse({...base,backgroundColor:'#d71920',link:'/products?gender=MEN'})).toMatchObject({backgroundColor:'#D71920',link:'/products?gender=MEN'}));
  it('rejects unsafe links',()=>expect(()=>updateAnnouncementSchema.parse({...base,link:'javascript:alert(1)'})).toThrow());
  it('rejects arbitrary CSS color input',()=>expect(()=>updateAnnouncementSchema.parse({...base,backgroundColor:'url(evil)'})).toThrow('Banner color must use #RRGGBB format'));
  it('rejects an end time that is not after the start',()=>expect(()=>updateAnnouncementSchema.parse({...base,startsAt:'2026-08-21T00:00:00Z',endsAt:'2026-08-20T00:00:00Z'})).toThrow('End time must be after start time'));
});
