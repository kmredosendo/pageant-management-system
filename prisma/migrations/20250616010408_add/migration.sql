/*
  Warnings:

  - Added the required column `number` to the `Contestant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `contestant` ADD COLUMN `number` INTEGER NOT NULL,
    ADD COLUMN `sex` VARCHAR(191) NULL;
