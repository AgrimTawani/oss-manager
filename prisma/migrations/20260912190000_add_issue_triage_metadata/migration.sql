-- Metadata used by inbox opportunity filters. Nullable values mean the legacy
-- notification has not completed its first GitHub metadata sync yet.
ALTER TABLE "Notification"
ADD COLUMN "issueState" TEXT,
ADD COLUMN "assigneeCount" INTEGER,
ADD COLUMN "linkedPullRequestCount" INTEGER,
ADD COLUMN "metadataUpdatedAt" TIMESTAMP(3);

CREATE INDEX "Notification_metadataUpdatedAt_idx" ON "Notification"("metadataUpdatedAt");
