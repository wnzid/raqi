import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AnnouncementAdminController, AnnouncementController } from './announcement.controller';
import { AnnouncementService } from './announcement.service';

@Module({ imports: [AuthModule], controllers: [AnnouncementController, AnnouncementAdminController], providers: [AnnouncementService] })
export class AnnouncementModule {}
