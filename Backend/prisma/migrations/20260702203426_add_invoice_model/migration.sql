-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "workerPayout" DOUBLE PRECISION NOT NULL,
    "platformFee" DOUBLE PRECISION NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "jobDescription" TEXT NOT NULL,
    "jobCategory" TEXT NOT NULL,
    "jobScope" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3) NOT NULL,
    "customerName" TEXT,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT,
    "workerName" TEXT,
    "workerEmail" TEXT NOT NULL,
    "workerPhone" TEXT,
    "workerSkills" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "Invoice_jobId_idx" ON "Invoice"("jobId");

-- CreateIndex
CREATE INDEX "Invoice_customerId_idx" ON "Invoice"("customerId");

-- CreateIndex
CREATE INDEX "Invoice_workerId_idx" ON "Invoice"("workerId");

-- CreateIndex
CREATE INDEX "Invoice_invoiceNumber_idx" ON "Invoice"("invoiceNumber");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;
