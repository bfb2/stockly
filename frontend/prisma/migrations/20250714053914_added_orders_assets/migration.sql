/*
  Warnings:

  - You are about to drop the column `assets` on the `PaperTradeAccount` table. All the data in the column will be lost.
  - You are about to drop the column `orders` on the `PaperTradeAccount` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PaperTradeAccount" DROP COLUMN "assets",
DROP COLUMN "orders";

-- CreateTable
CREATE TABLE "PaperTradeOrder" (
    "id" SERIAL NOT NULL,
    "paperTradeAccountId" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "orderType" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "submitted" TIMESTAMP(3) NOT NULL,
    "orderPrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PaperTradeOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assets" (
    "id" SERIAL NOT NULL,
    "ticker" TEXT NOT NULL,
    "paperTradeAccountId" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,

    CONSTRAINT "Assets_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PaperTradeOrder" ADD CONSTRAINT "PaperTradeOrder_paperTradeAccountId_fkey" FOREIGN KEY ("paperTradeAccountId") REFERENCES "PaperTradeAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assets" ADD CONSTRAINT "Assets_paperTradeAccountId_fkey" FOREIGN KEY ("paperTradeAccountId") REFERENCES "PaperTradeAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
