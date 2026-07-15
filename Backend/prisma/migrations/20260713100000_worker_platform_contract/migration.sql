-- CreateTable
CREATE TABLE "WorkerPlatformContract" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "isSigned" BOOLEAN NOT NULL DEFAULT false,
    "platformFeePercent" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "signedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkerPlatformContract_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkerPlatformContract_workerId_key" ON "WorkerPlatformContract"("workerId");

-- CreateIndex
CREATE INDEX "WorkerPlatformContract_isSigned_idx" ON "WorkerPlatformContract"("isSigned");

-- AddForeignKey
ALTER TABLE "WorkerPlatformContract" ADD CONSTRAINT "WorkerPlatformContract_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed contract rows for existing workers
INSERT INTO "WorkerPlatformContract" ("id", "workerId", "isSigned", "platformFeePercent", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, "id", false, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Worker"
WHERE "deletedAt" IS NULL;
