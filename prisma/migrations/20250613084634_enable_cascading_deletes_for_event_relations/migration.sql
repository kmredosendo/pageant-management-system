-- DropForeignKey
ALTER TABLE `contestant` DROP FOREIGN KEY `Contestant_eventId_fkey`;

-- DropForeignKey
ALTER TABLE `criteria` DROP FOREIGN KEY `Criteria_eventId_fkey`;

-- DropForeignKey
ALTER TABLE `judge` DROP FOREIGN KEY `Judge_eventId_fkey`;

-- DropForeignKey
ALTER TABLE `score` DROP FOREIGN KEY `Score_contestantId_fkey`;

-- DropForeignKey
ALTER TABLE `score` DROP FOREIGN KEY `Score_criteriaId_fkey`;

-- DropForeignKey
ALTER TABLE `score` DROP FOREIGN KEY `Score_judgeId_fkey`;

-- DropIndex
DROP INDEX `Contestant_eventId_fkey` ON `contestant`;

-- DropIndex
DROP INDEX `Criteria_eventId_fkey` ON `criteria`;

-- DropIndex
DROP INDEX `Judge_eventId_fkey` ON `judge`;

-- DropIndex
DROP INDEX `Score_contestantId_fkey` ON `score`;

-- DropIndex
DROP INDEX `Score_criteriaId_fkey` ON `score`;

-- DropIndex
DROP INDEX `Score_judgeId_fkey` ON `score`;

-- AddForeignKey
ALTER TABLE `Contestant` ADD CONSTRAINT `Contestant_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Judge` ADD CONSTRAINT `Judge_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Criteria` ADD CONSTRAINT `Criteria_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Score` ADD CONSTRAINT `Score_contestantId_fkey` FOREIGN KEY (`contestantId`) REFERENCES `Contestant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Score` ADD CONSTRAINT `Score_judgeId_fkey` FOREIGN KEY (`judgeId`) REFERENCES `Judge`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Score` ADD CONSTRAINT `Score_criteriaId_fkey` FOREIGN KEY (`criteriaId`) REFERENCES `Criteria`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
