-- AlterTable
ALTER TABLE "PaperTradeOrder" ADD COLUMN     "assetId" INTEGER;

-- AddForeignKey
ALTER TABLE "PaperTradeOrder" ADD CONSTRAINT "PaperTradeOrder_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
