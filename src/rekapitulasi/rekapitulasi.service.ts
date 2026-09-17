import { BadRequestException, Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class RekapitulasiService {
  constructor(private readonly prisma: PrismaService) {}

  async getBulanan(bulan: string) {
    if (!bulan || !/^\d{4}-(0[1-9]|1[0-2])$/.test(bulan)) {
      throw new BadRequestException(
        'Format bulan harus YYYY-MM, contoh: 2026-09',
      );
    }

    const [tahun, bulanAngka] = bulan.split('-').map(Number);

    const tanggalMulai = new Date(tahun, bulanAngka - 1, 1);
    const tanggalSelesai = new Date(tahun, bulanAngka, 1);

    const setoran = await this.prisma.setorsampah.findMany({
      where: {
        tanggal: {
          gte: tanggalMulai,
          lt: tanggalSelesai,
        },
        status: {
          in: ['diverifikasi', 'selesai'],
        },
      },
      include: {
        detailsetor: {
          include: {
            kategorisampah: true,
          },
        },
      },
    });

    let totalKg = 0;
    let totalEstimasiPembayaranRupiah = 0;
    let totalPoinDiterbitkan = 0;

    const breakdownJenisSampah = {
      plastik: {
        totalKg: 0,
        totalEstimasiPembayaranRupiah: 0,
      },
      kertas: {
        totalKg: 0,
        totalEstimasiPembayaranRupiah: 0,
      },
      logam: {
        totalKg: 0,
        totalEstimasiPembayaranRupiah: 0,
      },
      kaca: {
        totalKg: 0,
        totalEstimasiPembayaranRupiah: 0,
      },
    };

    for (const setor of setoran) {
      totalPoinDiterbitkan += setor.totalPoin;

      for (const detail of setor.detailsetor) {
        const beratKg = detail.beratKg;
        const hargaPerKg = detail.kategorisampah.hargaPerKg;

        const estimasiPembayaran = beratKg * hargaPerKg;

        totalKg += beratKg;
        totalEstimasiPembayaranRupiah += estimasiPembayaran;

        const jenis = detail.kategorisampah.jenis;

        breakdownJenisSampah[jenis].totalKg += beratKg;
        breakdownJenisSampah[jenis].totalEstimasiPembayaranRupiah +=
          estimasiPembayaran;
      }
    }

    return {
      statusCode: 200,
      success: true,
      message: 'Rekapitulasi bulanan berhasil diambil',
      data: {
        periode: bulan,
        rekapitulasiTonase: {
          totalKg,
          totalTon: totalKg / 1000,
          totalEstimasiPembayaranRupiah,
          totalPoinDiterbitkan,
        },
        breakdownJenisSampah,
      },
    };
  }
}