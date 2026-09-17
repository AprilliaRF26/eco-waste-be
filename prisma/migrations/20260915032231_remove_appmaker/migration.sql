-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_appMakerId_fkey`;

-- DropIndex
DROP INDEX `User_appMakerId_fkey` ON `User`;

-- DropIndex
DROP INDEX `User_username_appMakerId_key` ON `User`;

-- AlterTable
ALTER TABLE `SetorSampah` ADD COLUMN `kodeSetor` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `appMakerId`;

-- DropTable
DROP TABLE `AppMaker`;

-- CreateIndex
CREATE UNIQUE INDEX `setorsampah_kodeSetor_key` ON `SetorSampah`(`kodeSetor`);

-- CreateIndex
CREATE UNIQUE INDEX `user_username_key` ON `User`(`username`);