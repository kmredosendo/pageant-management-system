/*
  Warnings:

  - You are about to drop the column `password` on the `judge` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `judge` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Judge_username_key` ON `judge`;

-- AlterTable
ALTER TABLE `judge` DROP COLUMN `password`,
    DROP COLUMN `username`;
