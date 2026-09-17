-- CreateTable
CREATE TABLE `AppMaker` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `namaSiswa` VARCHAR(191) NOT NULL,
    `kelas` VARCHAR(191) NOT NULL,
    `namaApp` VARCHAR(191) NOT NULL,
    `appKey` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AppMaker_email_key`(`email`),
    UNIQUE INDEX `AppMaker_appKey_key`(`appKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'NASABAH') NOT NULL,
    `appMakerId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_username_appMakerId_key`(`username`, `appMakerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Nasabah` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `namaNasabah` VARCHAR(191) NOT NULL,
    `alamat` VARCHAR(191) NOT NULL,
    `telp` VARCHAR(191) NOT NULL,
    `tanggalLahir` DATETIME(3) NULL,
    `saldoPoin` INTEGER NOT NULL DEFAULT 0,
    `foto` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Nasabah_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdminBank` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `namaUnit` VARCHAR(191) NOT NULL,
    `namaPengelola` VARCHAR(191) NOT NULL,
    `telp` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AdminBank_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `KategoriSampah` (
    `id` VARCHAR(191) NOT NULL,
    `namaKategori` VARCHAR(191) NOT NULL,
    `hargaPerKg` INTEGER NOT NULL,
    `poinPerKg` INTEGER NOT NULL,
    `jenis` ENUM('plastik', 'kertas', 'logam', 'kaca') NOT NULL,
    `foto` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SetorSampah` (
    `id` VARCHAR(191) NOT NULL,
    `nasabahId` VARCHAR(191) NOT NULL,
    `tanggal` DATETIME(3) NOT NULL,
    `status` ENUM('menunggu_konfirmasi', 'diverifikasi', 'ditolak', 'selesai') NOT NULL DEFAULT 'menunggu_konfirmasi',
    `totalBeratKg` DOUBLE NOT NULL DEFAULT 0,
    `totalPoin` INTEGER NOT NULL DEFAULT 0,
    `catatan` VARCHAR(191) NULL,
    `catatanAdmin` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DetailSetor` (
    `id` VARCHAR(191) NOT NULL,
    `setorSampahId` VARCHAR(191) NOT NULL,
    `kategoriSampahId` VARCHAR(191) NOT NULL,
    `beratKg` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Hadiah` (
    `id` VARCHAR(191) NOT NULL,
    `namaHadiah` VARCHAR(191) NOT NULL,
    `poinDibutuhkan` INTEGER NOT NULL,
    `stok` INTEGER NOT NULL,
    `foto` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PenukaranPoin` (
    `id` VARCHAR(191) NOT NULL,
    `nasabahId` VARCHAR(191) NOT NULL,
    `hadiahId` VARCHAR(191) NOT NULL,
    `poin` INTEGER NOT NULL,
    `status` ENUM('diproses', 'selesai', 'dibatalkan') NOT NULL DEFAULT 'diproses',
    `catatan` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_appMakerId_fkey` FOREIGN KEY (`appMakerId`) REFERENCES `AppMaker`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Nasabah` ADD CONSTRAINT `Nasabah_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdminBank` ADD CONSTRAINT `AdminBank_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SetorSampah` ADD CONSTRAINT `SetorSampah_nasabahId_fkey` FOREIGN KEY (`nasabahId`) REFERENCES `Nasabah`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetailSetor` ADD CONSTRAINT `DetailSetor_setorSampahId_fkey` FOREIGN KEY (`setorSampahId`) REFERENCES `SetorSampah`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetailSetor` ADD CONSTRAINT `DetailSetor_kategoriSampahId_fkey` FOREIGN KEY (`kategoriSampahId`) REFERENCES `KategoriSampah`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PenukaranPoin` ADD CONSTRAINT `PenukaranPoin_nasabahId_fkey` FOREIGN KEY (`nasabahId`) REFERENCES `Nasabah`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PenukaranPoin` ADD CONSTRAINT `PenukaranPoin_hadiahId_fkey` FOREIGN KEY (`hadiahId`) REFERENCES `Hadiah`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
