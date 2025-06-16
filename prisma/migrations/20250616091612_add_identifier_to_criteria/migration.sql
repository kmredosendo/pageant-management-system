/*
  Warnings:

  - A unique constraint covering the columns `[identifier]` on the table `Criteria` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `criteria` ADD COLUMN `identifier` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Criteria_identifier_key` ON `Criteria`(`identifier`);
