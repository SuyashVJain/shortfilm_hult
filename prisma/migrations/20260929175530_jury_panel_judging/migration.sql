-- DropForeignKey
ALTER TABLE "Evaluation" DROP CONSTRAINT "Evaluation_juryId_fkey";

-- DropIndex
DROP INDEX "Evaluation_juryId_idx";

-- DropIndex
DROP INDEX "Evaluation_submissionId_juryId_key";

-- AlterTable
ALTER TABLE "Evaluation" DROP COLUMN "juryId",
ADD COLUMN     "adminUnlockedAt" TIMESTAMP(3),
ADD COLUMN     "juryAccountId" TEXT NOT NULL,
ADD COLUMN     "locked" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lockedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "locationId" TEXT;

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JuryAccount" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JuryAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JurySession" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "juryAccountId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JurySession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Location_name_key" ON "Location"("name");

-- CreateIndex
CREATE UNIQUE INDEX "JuryAccount_username_key" ON "JuryAccount"("username");

-- CreateIndex
CREATE INDEX "JuryAccount_locationId_idx" ON "JuryAccount"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "JurySession_tokenHash_key" ON "JurySession"("tokenHash");

-- CreateIndex
CREATE INDEX "JurySession_juryAccountId_idx" ON "JurySession"("juryAccountId");

-- CreateIndex
CREATE INDEX "Evaluation_juryAccountId_idx" ON "Evaluation"("juryAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Evaluation_submissionId_juryAccountId_key" ON "Evaluation"("submissionId", "juryAccountId");

-- CreateIndex
CREATE INDEX "Team_locationId_idx" ON "Team"("locationId");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_juryAccountId_fkey" FOREIGN KEY ("juryAccountId") REFERENCES "JuryAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JuryAccount" ADD CONSTRAINT "JuryAccount_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JurySession" ADD CONSTRAINT "JurySession_juryAccountId_fkey" FOREIGN KEY ("juryAccountId") REFERENCES "JuryAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
