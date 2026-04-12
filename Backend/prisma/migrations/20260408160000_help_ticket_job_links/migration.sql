-- AlterTable
ALTER TABLE "HelpTicket" ADD COLUMN "jobId" TEXT;

-- CreateIndex
CREATE INDEX "HelpTicket_jobId_idx" ON "HelpTicket"("jobId");

-- AddForeignKey
ALTER TABLE "HelpTicket" ADD CONSTRAINT "HelpTicket_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;
