-- Add reservation expiry timestamp used to release held stock for unpaid requests.
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3);
