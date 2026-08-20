import type {ActiveAnnouncement} from '@footwear/shared';
import {cleanup,render,screen} from '@testing-library/react';
import React from 'react';
import {afterEach,describe,expect,it} from 'vitest';
import {AnnouncementBanner,announcementTextColor} from './announcement-banner';
afterEach(cleanup);
describe('AnnouncementBanner',()=>{
  it('uses the default sale red when legacy configuration has no color',()=>{const legacy={message:'SALE',link:null} as ActiveAnnouncement;render(<AnnouncementBanner announcement={legacy}/>);expect(screen.getByTestId('storefront-announcement').getAttribute('style')).toContain('background-color: rgb(215, 25, 32)')});
  it('uses a custom color with automatic readable contrast',()=>{render(<AnnouncementBanner announcement={{message:'SALE',backgroundColor:'#000000',link:null}}/>);const banner=screen.getByTestId('storefront-announcement');expect(banner.getAttribute('style')).toContain('background-color: rgb(0, 0, 0)');expect(announcementTextColor('#FFFFFF')).toBe('#111111');expect(announcementTextColor('#000000')).toBe('#FFFFFF')});
  it('renders repeated separated messages in two identical groups and preserves the link',()=>{render(<AnnouncementBanner announcement={{message:'SALE',backgroundColor:'#D71920',link:'/products'}}/>);expect(screen.getAllByText('SALE').length).toBeGreaterThan(20);expect(screen.getAllByText('·').length).toBeGreaterThan(20);expect(screen.getByTestId('announcement-track').querySelectorAll('.announcement-group')).toHaveLength(2);expect(screen.getByRole('link',{name:'SALE'}).getAttribute('href')).toBe('/products')});
  it('renders no marquee or layout gap when inactive',()=>{const{container}=render(<AnnouncementBanner announcement={null}/>);expect(container.innerHTML).toBe('');expect(screen.queryByTestId('announcement-marquee')).toBeNull()});
});
