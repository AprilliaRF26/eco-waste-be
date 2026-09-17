-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `User_appMakerId_fkey`;

-- DropIndex
DROP INDEX `User_appMakerId_fkey` ON `user`;

-- DropIndex
DROP INDEX `User_username_appMakerId_key` ON `user`;

-- AlterTable
ALTER TABLE `setorsampah` ADD COLUMN `kodeSetor` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `appMakerId`;

-- DropTable
DROP TABLE `appmaker`;

-- CreateIndex
CREATE UNIQUE INDEX `setorsampah_kodeSetor_key` ON `setorsampah`(`kodeSetor`);

-- CreateIndex
CREATE UNIQUE INDEX `user_username_key` ON `user`(`username`);