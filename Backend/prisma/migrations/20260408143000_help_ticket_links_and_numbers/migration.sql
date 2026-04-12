-- AlterTable
ALTER TABLE "HelpTicket" ADD COLUMN "ticketNumber" TEXT;
ALTER TABLE "HelpTicket" ADD COLUMN "reservationId" TEXT;
ALTER TABLE "HelpTicket" ADD COLUMN "workerId" TEXT;
ALTER TABLE "HelpTicket" ADD COLUMN "organisationId" TEXT;

-- Backfill existing rows before making ticketNumber required
UPDATE "HelpTicket"
SET "ticketNumber" = 'TKT-LEGACY-' || UPPER(SUBSTRING(REPLACE("id", '-', '') FROM 1 FOR 8))
WHERE "ticketNumber" IS NULL;

-- AlterTable
ALTER TABLE "HelpTicket" ALTER COLUMN "ticketNumber" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "HelpTicket_ticketNumber_key" ON "HelpTicket"("ticketNumber");

-- CreateIndex
CREATE INDEX "HelpTicket_ticketNumber_idx" ON "HelpTicket"("ticketNumber");
CREATE INDEX "HelpTicket_reservationId_idx" ON "HelpTicket"("reservationId");
CREATE INDEX "HelpTicket_workerId_idx" ON "HelpTicket"("workerId");
CREATE INDEX "HelpTicket_organisationId_idx" ON "HelpTicket"("organisationId");

-- AddForeignKey
ALTER TABLE "HelpTicket" ADD CONSTRAINT "HelpTicket_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "HelpTicket" ADD CONSTRAINT "HelpTicket_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "HelpTicket" ADD CONSTRAINT "HelpTicket_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
