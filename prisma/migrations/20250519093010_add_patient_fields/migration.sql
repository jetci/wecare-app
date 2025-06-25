/*
  Warnings:

  - You are about to drop the column `village` on the `Patient` table. All the data in the column will be lost.
  - Added the required column `addrMoo` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `addrNo` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `age` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bloodGroup` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dob` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `villageName` to the `Patient` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "village",
ADD COLUMN     "addrMoo" TEXT NOT NULL,
ADD COLUMN     "addrNo" TEXT NOT NULL,
ADD COLUMN     "age" INTEGER NOT NULL,
ADD COLUMN     "bloodGroup" TEXT NOT NULL,
ADD COLUMN     "copyAddr" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "currDist" TEXT,
ADD COLUMN     "currMoo" TEXT,
ADD COLUMN     "currNo" TEXT,
ADD COLUMN     "currProv" TEXT,
ADD COLUMN     "currSub" TEXT,
ADD COLUMN     "currVillageName" TEXT,
ADD COLUMN     "dob" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "gender" TEXT NOT NULL,
ADD COLUMN     "needTool" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "otherGroup" TEXT,
ADD COLUMN     "remark" TEXT,
ADD COLUMN     "statusCannotHelpSelf" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "statusHelpSelf" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "toolRemark" TEXT,
ADD COLUMN     "villageName" TEXT NOT NULL;
