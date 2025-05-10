/*
  Warnings:

  - The `createdAt` column on the `Todo` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `dueDate` column on the `Todo` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `completedAt` column on the `Todo` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Todo" DROP COLUMN "createdAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "dueDate",
ADD COLUMN     "dueDate" TIMESTAMP(3),
DROP COLUMN "completedAt",
ADD COLUMN     "completedAt" TIMESTAMP(3);
