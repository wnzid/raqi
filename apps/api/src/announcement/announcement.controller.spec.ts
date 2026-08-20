import { describe, expect, it } from 'vitest';
import { AdminGuard } from '../auth/admin.guard';
import { AuthGuard } from '../auth/auth.guard';
import { AnnouncementAdminController, AnnouncementController } from './announcement.controller';

describe('announcement endpoint access', () => {
  it('keeps the public active-banner read unguarded', () => expect(Reflect.getMetadata('__guards__', AnnouncementController)).toBeUndefined());
  it('requires authentication and an admin role for configuration', () => expect(Reflect.getMetadata('__guards__', AnnouncementAdminController)).toEqual([AuthGuard, AdminGuard]));
});
