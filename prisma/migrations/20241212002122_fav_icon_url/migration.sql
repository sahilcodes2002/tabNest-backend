/*
  Warnings:

  - You are about to drop the column `link` on the `Tab` table. All the data in the column will be lost.
  - Added the required column `favIconUrl` to the `Tab` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `Tab` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tab" DROP COLUMN "link",
ADD COLUMN     "favIconUrl" TEXT NOT NULL,
ADD COLUMN     "url" TEXT NOT NULL;
