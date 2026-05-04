ALTER TABLE "User"
ADD COLUMN "isBlacklisted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "blacklistedReason" TEXT,
ADD COLUMN "blacklistedAt" TIMESTAMP(3),
ADD COLUMN "blacklistedByUserId" TEXT;
