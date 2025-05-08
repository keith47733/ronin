-- CreateTable
CREATE TABLE "Todo" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL,
    "isWaiting" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "note" TEXT,
    "quadrant" TEXT NOT NULL,
    "deleted" BOOLEAN,

    CONSTRAINT "Todo_pkey" PRIMARY KEY ("id")
);
