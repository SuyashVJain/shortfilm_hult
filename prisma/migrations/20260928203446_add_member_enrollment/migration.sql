/*
  Warnings:

  - Added the required column `enrollmentNumber` to the `TeamMember` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TeamMember" ADD COLUMN     "enrollmentNumber" TEXT NOT NULL;
