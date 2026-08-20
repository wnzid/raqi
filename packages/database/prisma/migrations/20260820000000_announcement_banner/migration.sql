CREATE TABLE "AnnouncementBanner" (
  "id" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "isEnabled" BOOLEAN NOT NULL DEFAULT FALSE,
  "startsAt" TIMESTAMP(3),
  "endsAt" TIMESTAMP(3),
  "link" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AnnouncementBanner_pkey" PRIMARY KEY ("id")
);
