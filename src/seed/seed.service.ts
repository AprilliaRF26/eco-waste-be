import { BadRequestException, Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class SeedService {
  constructor(private readonly prisma: PrismaService) {}

  async seed() {
    const adminPassword = await bcrypt.hash('admin123', 10);
    const nasabahPassword = await bcrypt.hash('nasabah123', 10);

    // =========================
    // ADMIN
    // =========================

    const admin = await this.prisma.user.upsert({
      where: {
        username: 'admin',
      },
      update: {},
      create: {
        username: 'admin',
        password: adminPassword,
        role: 'ADMIN',
        adminbank: {
          create: {
            namaUnit: 'Bank Sampah Eco Waste',
            namaPengelola: 'Admin Eco Waste',
            telp: '081234567890',
          },
        },
      },
      include: {
        adminbank: true,
      },
    });

    // =========================
    // NASABAH
    // =========================

    const nasabah = await this.prisma.user.upsert({
      where: {
        username: 'nasabah',
      },
      update: {},
      create: {
        username: 'nasabah',
        password: nasabahPassword,
        role: 'NASABAH',
        nasabah: {
          create: {
            namaNasabah: 'Nasabah Eco Waste',
            alamat: 'Malang',
            telp: '081234567891',
            saldoPoin: 0,
          },
        },
      },
      include: {
        nasabah: true,
      },
    });

    if (!nasabah.nasabah) {
      throw new BadRequestException(
        'Data nasabah seed tidak berhasil dibuat.',
      );
    }

    // =========================
    // KATEGORI SAMPAH
    // =========================

    const kategoriData = [
      {
        id: 'seed-plastik',
        namaKategori: 'Plastik',
        hargaPerKg: 3000,
        poinPerKg: 10,
        jenis: 'plastik' as const,
      },
      {
        id: 'seed-kertas',
        namaKategori: 'Kertas',
        hargaPerKg: 2500,
        poinPerKg: 8,
        jenis: 'kertas' as const,
      },
      {
        id: 'seed-logam',
        namaKategori: 'Logam',
        hargaPerKg: 5000,
        poinPerKg: 15,
        jenis: 'logam' as const,
      },
      {
        id: 'seed-kaca',
        namaKategori: 'Kaca',
        hargaPerKg: 2000,
        poinPerKg: 6,
        jenis: 'kaca' as const,
      },
    ];

    for (const kategori of kategoriData) {
      await this.prisma.kategorisampah.upsert({
        where: {
          id: kategori.id,
        },
        update: {
          namaKategori: kategori.namaKategori,
          hargaPerKg: kategori.hargaPerKg,
          poinPerKg: kategori.poinPerKg,
          jenis: kategori.jenis,
        },
        create: kategori,
      });
    }

    // =========================
    // HADIAH
    // =========================

    const hadiahData = [
      {
        id: 'seed-hadiah-1',
        namaHadiah: 'Voucher Belanja Rp10.000',
        poinDibutuhkan: 100,
        stok: 20,
      },
      {
        id: 'seed-hadiah-2',
        namaHadiah: 'Tumbler Eco Waste',
        poinDibutuhkan: 200,
        stok: 10,
      },
      {
        id: 'seed-hadiah-3',
        namaHadiah: 'Tas Belanja Ramah Lingkungan',
        poinDibutuhkan: 150,
        stok: 15,
      },
    ];

    for (const hadiah of hadiahData) {
      await this.prisma.hadiah.upsert({
        where: {
          id: hadiah.id,
        },
        update: {
          namaHadiah: hadiah.namaHadiah,
          poinDibutuhkan: hadiah.poinDibutuhkan,
          stok: hadiah.stok,
        },
        create: hadiah,
      });
    }

    // =========================
    // DATA SETOR SAMPAH
    // =========================

    const setorSeed = await this.prisma.setorsampah.upsert({
      where: {
        kodeSetor: 'STR-SEED-0001',
      },
      update: {
        nasabahId: nasabah.nasabah.id,
        tanggal: new Date(),
        status: 'selesai',
        totalBeratKg: 20,
        totalPoin: 180,
        catatan: 'Data setor untuk keperluan seed',
        catatanAdmin: 'Setoran seed telah diverifikasi',
      },
      create: {
        id: 'seed-setor-1',
        kodeSetor: 'STR-SEED-0001',
        nasabahId: nasabah.nasabah.id,
        tanggal: new Date(),
        status: 'selesai',
        totalBeratKg: 20,
        totalPoin: 180,
        catatan: 'Data setor untuk keperluan seed',
        catatanAdmin: 'Setoran seed telah diverifikasi',
      },
    });

    // =========================
    // DETAIL SETOR
    // =========================

    await this.prisma.detailsetor.upsert({
      where: {
        id: 'seed-detail-1',
      },
      update: {
        setorSampahId: setorSeed.id,
        kategoriSampahId: 'seed-plastik',
        beratKg: 10,
      },
      create: {
        id: 'seed-detail-1',
        setorSampahId: setorSeed.id,
        kategoriSampahId: 'seed-plastik',
        beratKg: 10,
      },
    });

    await this.prisma.detailsetor.upsert({
      where: {
        id: 'seed-detail-2',
      },
      update: {
        setorSampahId: setorSeed.id,
        kategoriSampahId: 'seed-kertas',
        beratKg: 10,
      },
      create: {
        id: 'seed-detail-2',
        setorSampahId: setorSeed.id,
        kategoriSampahId: 'seed-kertas',
        beratKg: 10,
      },
    });

    // =========================
    // DATA PENUKARAN POIN
    // =========================

    const penukaranSeed = await this.prisma.penukaranpoin.upsert({
      where: {
        kodePenukaran: 'TKR-SEED-0001',
      },
      update: {
        hadiahId: 'seed-hadiah-1',
        nasabahId: nasabah.nasabah.id,
        poin: 100,
        status: 'selesai',
        catatan: 'Data penukaran untuk keperluan seed',
      },
      create: {
        id: 'seed-penukaran-1',
        kodePenukaran: 'TKR-SEED-0001',
        nasabahId: nasabah.nasabah.id,
        hadiahId: 'seed-hadiah-1',
        poin: 100,
        status: 'selesai',
        catatan: 'Data penukaran untuk keperluan seed',
      },
    });

    // =========================
    // SALDO AKHIR NASABAH
    // =========================

    // Total poin setor = 180
    // Poin penukaran = 100
    // Saldo akhir = 80

    await this.prisma.nasabah.update({
      where: {
        id: nasabah.nasabah.id,
      },
      data: {
        saldoPoin: 80,
      },
    });

    // =========================
    // STOK HADIAH
    // =========================

    // Stok awal voucher = 20
    // Sudah digunakan 1
    // Stok akhir = 19

    await this.prisma.hadiah.update({
      where: {
        id: 'seed-hadiah-1',
      },
      data: {
        stok: 19,
      },
    });

    // =========================
    // RESPONSE
    // =========================

    return {
      statusCode: 201,
      success: true,
      message: 'Data seed berhasil dibuat',
      data: {
        admin: {
          id: admin.id,
          username: admin.username,
          password: 'admin123',
          role: admin.role,
        },
        nasabah: {
          id: nasabah.id,
          username: nasabah.username,
          password: 'nasabah123',
          role: nasabah.role,
        },
        kategoriSampah: kategoriData.length,
        hadiah: hadiahData.length,
        setorSampah: 1,
        detailSetor: 2,
        penukaranPoin: 1,
        totalBeratKg: 20,
        totalPoinSetor: 180,
        poinDitukar: 100,
        saldoPoinNasabah: 80,
        stokHadiahVoucher: 19,
        kodeSetor: setorSeed.kodeSetor,
        kodePenukaran: penukaranSeed.kodePenukaran,
      },
    };
  }
}