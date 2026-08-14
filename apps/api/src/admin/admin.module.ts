import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminController } from './admin.controller';
import { AdminCatalogController } from './admin-catalog.controller'; import { AdminCatalogService } from './admin-catalog.service';

@Module({ imports: [AuthModule], controllers: [AdminController, AdminCatalogController], providers: [AdminCatalogService] })
export class AdminModule {}
