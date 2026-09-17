/*
  Warnings:

  - A unique constraint covering the columns `[kodePenukaran]` on the table `PenukaranPoin` will be added.
  - Added the required column `kodePenukaran` to the `PenukaranPoin` table without a default value.
*/

-- AlterTable
ALTER TABLE `PenukaranPoin` ADD COLUMN `kodePenukaran` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `PenukaranPoin_kodePenukaran_key` ON `PenukaranPoin`(`kodePenukaran`);