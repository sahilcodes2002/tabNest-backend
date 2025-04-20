/*
  Warnings:

  - Added the required column `date` to the `Tab` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tabid` to the `Tab` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tab" ADD COLUMN     "date" TEXT NOT NULL,
ADD COLUMN     "tabid" INTEGER NOT NULL;
