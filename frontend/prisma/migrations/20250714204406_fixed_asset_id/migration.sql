/*
  Warnings:

  - The primary key for the `Assets` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "PaperTradeOrder" DROP CONSTRAINT "PaperTradeOrder_assetId_fkey";

-- AlterTable
ALTER TABLE "Assets" DROP CONSTRAINT "Assets_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Assets_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Assets_id_seq";

-- AlterTable
ALTER TABLE "PaperTradeOrder" ALTER COLUMN "assetId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "PaperTradeOrder" ADD CONSTRAINT "PaperTradeOrder_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
