/*
  Warnings:

  - You are about to alter the column `sex` on the `contestant` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `contestant` MODIFY `sex` ENUM('MALE', 'FEMALE') NULL;
