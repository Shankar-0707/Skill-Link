-- CreateEnum
CREATE TYPE "HelpTicketStatus" AS ENUM ('OPEN', 'RESOLVED', 'REJECTED');

-- CreateTable
CREATE TABLE "HelpTicket" (
    "id" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "HelpTicketStatus" NOT NULL DEFAULT 'OPEN',
    "resolutionNote" TEXT,
    "rejectionReason" TEXT,
    "reviewedByUserId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HelpTicket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HelpTicket_createdByUserId_idx" ON "HelpTicket"("createdByUserId");

-- CreateIndex
CREATE INDEX "HelpTicket_status_idx" ON "HelpTicket"("status");

-- CreateIndex
CREATE INDEX "HelpTicket_reviewedByUserId_idx" ON "HelpTicket"("reviewedByUserId");

-- AddForeignKey
ALTER TABLE "HelpTicket" ADD CONSTRAINT "HelpTicket_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpTicket" ADD CONSTRAINT "HelpTicket_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
