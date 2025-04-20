/*
  Warnings:

  - Added the required column `type` to the `Tab` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tab" ADD COLUMN     "type" INTEGER NOT NULL,
ALTER COLUMN "archive" DROP NOT NULL;
