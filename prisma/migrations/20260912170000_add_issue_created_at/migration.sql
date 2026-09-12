-- Keep GitHub's issue creation time separate from the time OSS Manager discovered it.
-- This starts nullable so existing notifications can be backfilled safely by the poller.
ALTER TABLE "Notification" ADD COLUMN "issueCreatedAt" TIMESTAMP(3);
