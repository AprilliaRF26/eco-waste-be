/*
  Warnings:

  - A unique constraint covering the columns `[kodePenukaran]` on the table `penukaranpoin` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `kodePenukaran` to the `penukaranpoin` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `penukaranpoin` ADD COLUMN `kodePenukaran` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `penukaranpoin_kodePenukaran_key` ON `penukaranpoin`(`kodePenukaran`);
