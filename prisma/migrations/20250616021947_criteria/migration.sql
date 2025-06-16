-- AlterTable
ALTER TABLE `criteria` ADD COLUMN `autoAssignToAllContestants` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `parentId` INTEGER NULL,
    MODIFY `weight` DOUBLE NULL;

-- AddForeignKey
ALTER TABLE `Criteria` ADD CONSTRAINT `Criteria_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Criteria`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
