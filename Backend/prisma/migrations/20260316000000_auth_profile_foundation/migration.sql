-- AlterTable
ALTER TABLE "User"
ADD COLUMN "name" TEXT,
ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false;

-- DropIndex
DROP INDEX "User_phone_key";

-- AlterTable
ALTER TABLE "User"
ALTER COLUMN "phone" DROP NOT NULL,
ALTER COLUMN "role" SET DEFAULT 'CUSTOMER';

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
