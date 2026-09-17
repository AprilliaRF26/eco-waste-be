import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const totalNasabah = await this.prisma.nasabah.count();

    const totalSetor = await this.prisma.setorsampah.count();

    const totalBerat = await this.prisma.setorsampah.aggregate({
      where: {
        status: {
          in: ['diverifikasi', 'selesai'],
        },
      },
      _sum: {
        totalBeratKg: true,
      },
    });

    const totalPoin = await this.prisma.setorsampah.aggregate({
      where: {
        status: {
          in: ['diverifikasi', 'selesai'],
        },
      },
      _sum: {
        totalPoin: true,
      },
    });

    const totalPenukaran = await this.prisma.penukaranpoin.count();

    const penukaranSelesai =
      await this.prisma.penukaranpoin.count({
        where: {
          status: 'selesai',
        },
      });

    const penukaranDiproses =
      await this.prisma.penukaranpoin.count({
        where: {
          status: 'diproses',
        },
      });

    const penukaranDibatalkan =
      await this.prisma.penukaranpoin.count({
        where: {
          status: 'dibatalkan',
        },
      });

    return {
      statusCode: 200,
      success: true,
      message: 'Dashboard summary berhasil diambil',
      data: {
        totalNasabah,
        totalSetor,
        totalBeratKg: totalBerat._sum.totalBeratKg ?? 0,
        totalPoinDiterbitkan: totalPoin._sum.totalPoin ?? 0,
        totalPenukaran,
        penukaran: {
          diproses: penukaranDiproses,
          selesai: penukaranSelesai,
          dibatalkan: penukaranDibatalkan,
        },
      },
    };
  }

  async getStats() {
    const totalNasabah = await this.prisma.nasabah.count();

    const totalSetor = await this.prisma.setorsampah.count();

    const totalBerat = await this.prisma.setorsampah.aggregate({
      where: {
        status: {
          in: ['diverifikasi', 'selesai'],
        },
      },
      _sum: {
        totalBeratKg: true,
      },
    });

    const totalPoin =
      await this.prisma.setorsampah.aggregate({
        where: {
          status: {
            in: ['diverifikasi', 'selesai'],
          },
        },
        _sum: {
          totalPoin: true,
        },
      });

    const totalPenukaran =
      await this.prisma.penukaranpoin.count();

    const penukaranSelesai =
      await this.prisma.penukaranpoin.count({
        where: {
          status: 'selesai',
        },
      });

    const penukaranDiproses =
      await this.prisma.penukaranpoin.count({
        where: {
          status: 'diproses',
        },
      });

    const penukaranDibatalkan =
      await this.prisma.penukaranpoin.count({
        where: {
          status: 'dibatalkan',
        },
      });

    return {
      statusCode: 200,
      success: true,
      message: 'Dashboard stats berhasil diambil',
      data: {
        totalNasabah,
        totalSetor,
        totalBeratKg: totalBerat._sum.totalBeratKg ?? 0,
        totalPoinDiterbitkan:
          totalPoin._sum.totalPoin ?? 0,
        totalPenukaran,
        penukaran: {
          diproses: penukaranDiproses,
          selesai: penukaranSelesai,
          dibatalkan: penukaranDibatalkan,
        },
      },
    };
  }
}