import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { updateAnnouncementSchema, type UpdateAnnouncementInput } from '@footwear/shared';
import { AdminGuard } from '../auth/admin.guard';
import { AuthGuard } from '../auth/auth.guard';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AnnouncementService } from './announcement.service';

@Controller('announcement')
export class AnnouncementController {
  constructor(private readonly announcements: AnnouncementService) {}
  @Get() active() { return this.announcements.active(); }
}

@UseGuards(AuthGuard, AdminGuard)
@Controller('admin/announcement')
export class AnnouncementAdminController {
  constructor(private readonly announcements: AnnouncementService) {}
  @Get() get() { return this.announcements.admin(); }
  @Patch() update(@CurrentUser() actor: AuthenticatedUser, @Body(new ZodValidationPipe(updateAnnouncementSchema)) input: UpdateAnnouncementInput) { return this.announcements.update(actor, input); }
}
