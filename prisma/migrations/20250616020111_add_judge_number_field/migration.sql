/*
  Warnings:

  - Added the required column `number` to the `Judge` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `judge` ADD COLUMN `number` INTEGER NOT NULL;
