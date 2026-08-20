import { Injectable } from '@nestjs/common';
import type { AnnouncementBanner } from '@footwear/database';
import type { ActiveAnnouncement, AnnouncementAdmin, UpdateAnnouncementInput } from '@footwear/shared';
import type { AuthenticatedUser } from '../auth/auth.types';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../infrastructure/prisma/prisma.service';

const BANNER_ID = 'storefront';
const DEFAULT_BACKGROUND_COLOR = '#D71920';

export function isAnnouncementActive(banner: Pick<AnnouncementBanner, 'isEnabled' | 'startsAt' | 'endsAt'>, now = new Date()): boolean {
  return banner.isEnabled && (!banner.startsAt || now >= banner.startsAt) && (!banner.endsAt || now < banner.endsAt);
}

@Injectable()
export class AnnouncementService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  async active(now = new Date()): Promise<ActiveAnnouncement> {
    const banner = await this.prisma.announcementBanner.findUnique({ where: { id: BANNER_ID } });
    return banner && isAnnouncementActive(banner, now) ? { message: banner.message, backgroundColor: banner.backgroundColor ?? DEFAULT_BACKGROUND_COLOR, link: banner.link } : null;
  }

  async admin(): Promise<AnnouncementAdmin> {
    const banner = await this.prisma.announcementBanner.findUnique({ where: { id: BANNER_ID } });
    return banner ? this.mapAdmin(banner) : { id: BANNER_ID, message: '', backgroundColor: DEFAULT_BACKGROUND_COLOR, isEnabled: false, startsAt: null, endsAt: null, link: null, updatedAt: null };
  }

  async update(actor: AuthenticatedUser, input: UpdateAnnouncementInput): Promise<AnnouncementAdmin> {
    const banner = await this.prisma.$transaction(async (tx) => {
      const previous = await tx.announcementBanner.findUnique({ where: { id: BANNER_ID }, select: { isEnabled: true } });
      const saved = await tx.announcementBanner.upsert({
        where: { id: BANNER_ID },
        create: { id: BANNER_ID, ...input },
        update: input,
      });
      const action = previous?.isEnabled === input.isEnabled ? 'ANNOUNCEMENT_UPDATED' : input.isEnabled ? 'ANNOUNCEMENT_ENABLED' : 'ANNOUNCEMENT_DISABLED';
      await this.audit.write(actor, action, 'AnnouncementBanner', BANNER_ID, { scheduled: Boolean(input.startsAt || input.endsAt), hasLink: Boolean(input.link) }, tx);
      return saved;
    });
    return this.mapAdmin(banner);
  }

  private mapAdmin(banner: AnnouncementBanner): AnnouncementAdmin {
    return { id: banner.id, message: banner.message, backgroundColor: banner.backgroundColor ?? DEFAULT_BACKGROUND_COLOR, isEnabled: banner.isEnabled, startsAt: banner.startsAt?.toISOString() ?? null, endsAt: banner.endsAt?.toISOString() ?? null, link: banner.link, updatedAt: banner.updatedAt.toISOString() };
  }
}
