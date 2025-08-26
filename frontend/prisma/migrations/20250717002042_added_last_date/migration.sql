/*
  Warnings:

  - Made the column `lastDividendDate` on table `Assets` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Assets" ALTER COLUMN "lastDividendDate" SET NOT NULL;

-- AlterTable
ALTER TABLE "PaperTradeOrder" ADD COLUMN     "dateLastChecked" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
