-- CreateEnum
CREATE TYPE "KycRequestStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- AlterTable KycRequest — audit fields
ALTER TABLE "KycRequest" ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN "reviewedBy" TEXT,
ADD COLUMN "reviewedAt" TIMESTAMP(3);

-- Migrate KycRequest.status from KycStatus to KycRequestStatus
ALTER TABLE "KycRequest" ADD COLUMN "status_new" "KycRequestStatus";

UPDATE "KycRequest" SET "status_new" = CASE "status"::text
  WHEN 'NOT_STARTED' THEN 'PENDING'::"KycRequestStatus"
  WHEN 'PENDING' THEN 'PENDING'::"KycRequestStatus"
  WHEN 'VERIFIED' THEN 'VERIFIED'::"KycRequestStatus"
  WHEN 'REJECTED' THEN 'REJECTED'::"KycRequestStatus"
  ELSE 'PENDING'::"KycRequestStatus"
END;

ALTER TABLE "KycRequest" DROP COLUMN "status";
ALTER TABLE "KycRequest" RENAME COLUMN "status_new" TO "status";
ALTER TABLE "KycRequest" ALTER COLUMN "status" SET NOT NULL;
ALTER TABLE "KycRequest" ALTER COLUMN "status" SET DEFAULT 'PENDING'::"KycRequestStatus";

ALTER TABLE "KycRequest" ALTER COLUMN "provider" SET DEFAULT 'INTERNAL';

-- AlterTable WorkerDocument — link to submission
ALTER TABLE "WorkerDocument" ADD COLUMN "kycRequestId" TEXT;

CREATE INDEX "WorkerDocument_kycRequestId_idx" ON "WorkerDocument"("kycRequestId");
CREATE INDEX "WorkerDocument_workerId_kycRequestId_idx" ON "WorkerDocument"("workerId", "kycRequestId");

ALTER TABLE "WorkerDocument" ADD CONSTRAINT "WorkerDocument_kycRequestId_fkey" FOREIGN KEY ("kycRequestId") REFERENCES "KycRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- At most one in-review submission per worker (DB-enforced)
CREATE UNIQUE INDEX "KycRequest_workerId_pending_key" ON "KycRequest"("workerId") WHERE status = 'PENDING';
