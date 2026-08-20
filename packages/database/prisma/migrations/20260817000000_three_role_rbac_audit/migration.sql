ALTER TYPE "UserRole" RENAME TO "UserRole_old";
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'MANAGER', 'SUPER_ADMIN');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole" USING (CASE WHEN "role"::text = 'ADMIN' THEN 'SUPER_ADMIN' ELSE "role"::text END)::"UserRole";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'CUSTOMER';
DROP TYPE "UserRole_old";

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "actorUserId" TEXT NOT NULL,
  "actorRole" "UserRole" NOT NULL,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "AuditLog_actorUserId_createdAt_idx" ON "AuditLog"("actorUserId", "createdAt");
CREATE INDEX "AuditLog_actorRole_createdAt_idx" ON "AuditLog"("actorRole", "createdAt");
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");
CREATE INDEX "AuditLog_entityType_createdAt_idx" ON "AuditLog"("entityType", "createdAt");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
