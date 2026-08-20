import { describe, expect, it } from 'vitest';
import { isAnnouncementActive } from './announcement.service';

const now = new Date('2026-08-20T12:00:00.000Z');
describe('announcement scheduling', () => {
  it('shows an enabled banner inside its schedule', () => expect(isAnnouncementActive({ isEnabled: true, startsAt: new Date('2026-08-20T00:00:00Z'), endsAt: new Date('2026-08-21T00:00:00Z') }, now)).toBe(true));
  it('hides a future banner', () => expect(isAnnouncementActive({ isEnabled: true, startsAt: new Date('2026-08-21T00:00:00Z'), endsAt: null }, now)).toBe(false));
  it('hides an expired banner', () => expect(isAnnouncementActive({ isEnabled: true, startsAt: null, endsAt: new Date('2026-08-20T12:00:00Z') }, now)).toBe(false));
  it('always hides a manually disabled banner', () => expect(isAnnouncementActive({ isEnabled: false, startsAt: null, endsAt: null }, now)).toBe(false));
});
