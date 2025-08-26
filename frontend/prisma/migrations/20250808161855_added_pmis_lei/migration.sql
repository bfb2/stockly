-- CreateTable
CREATE TABLE "MonthlyIndicatorData" (
    "id" TEXT NOT NULL DEFAULT 'lei_pmi',
    "lei" JSONB NOT NULL,
    "ManufacturingPmi" JSONB NOT NULL,
    "servicesPmi" JSONB NOT NULL,

    CONSTRAINT "MonthlyIndicatorData_pkey" PRIMARY KEY ("id")
);
