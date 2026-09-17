import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

import { TukarPoinDto } from './dto/tukar-poin.dto/tukar-poin.dto.js';
import { UpdateStatusPenukaranDto } from './dto/update-status-penukaran.dto/update-status-penukaran.dto.js';

@Injectable()
export class PenukaranPoinService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  private async generateKodePenukaran(
    tanggal: Date,
  ) {
    const tahun = tanggal.getFullYear();
    const bulan = String(
      tanggal.getMonth() + 1,
    ).padStart(2, '0');

    const jumlahPenukaran =
      await this.prisma.penukaranpoin.count({
        where: {
          createdAt: {
            gte: new Date(
              tahun,
              tanggal.getMonth(),
              1,
            ),
            lt: new Date(
              tahun,
              tanggal.getMonth() + 1,
              1,
            ),
          },
        },
      });

    const nomor = String(
      jumlahPenukaran + 1,
    ).padStart(4, '0');

    return `TKR-${tahun}${bulan}-${nomor}`;
  }

  async tukar(
    userId: string,
    dto: TukarPoinDto,
  ) {
    const nasabah =
      await this.prisma.nasabah.findUnique({
        where: {
          userId,
        },
      });

    if (!nasabah) {
      throw new NotFoundException(
        'Data nasabah tidak ditemukan',
      );
    }

    const hadiah =
      await this.prisma.hadiah.findUnique({
        where: {
          id: dto.hadiahId,
        },
      });

    if (!hadiah) {
      throw new NotFoundException(
        'Hadiah tidak ditemukan',
      );
    }

    if (hadiah.stok <= 0) {
      throw new BadRequestException(
        'Stok hadiah tidak tersedia',
      );
    }

    const totalPoin =
      hadiah.poinDibutuhkan;

    if (nasabah.saldoPoin < totalPoin) {
      throw new BadRequestException(
        'Saldo poin tidak mencukupi',
      );
    }

    const tanggal = new Date();
    const kodePenukaran =
      await this.generateKodePenukaran(
        tanggal,
      );

    const result =
      await this.prisma.$transaction(
        async (tx) => {
          const updatedNasabah =
            await tx.nasabah.update({
              where: {
                id: nasabah.id,
              },
              data: {
                saldoPoin: {
                  decrement: totalPoin,
                },
              },
            });

          const updatedHadiah =
            await tx.hadiah.update({
              where: {
                id: hadiah.id,
              },
              data: {
                stok: {
                  decrement: 1,
                },
              },
            });

          const penukaran =
            await tx.penukaranpoin.create({
              data: {
                kodePenukaran,
                nasabahId: nasabah.id,
                hadiahId: hadiah.id,
                poin: totalPoin,
                status: 'diproses',
              },
              include: {
                hadiah: true,
                nasabah: true,
              },
            });

          return {
            updatedNasabah,
            updatedHadiah,
            penukaran,
          };
        },
      );

    return {
      statusCode: 201,
      success: true,
      message:
        'Penukaran poin berhasil dibuat',
      data: result.penukaran,
    };
  }

  async findMyPenukaran(userId: string) {
    const nasabah =
      await this.prisma.nasabah.findUnique({
        where: {
          userId,
        },
      });

    if (!nasabah) {
      throw new NotFoundException(
        'Data nasabah tidak ditemukan',
      );
    }

    const data =
      await this.prisma.penukaranpoin.findMany({
        where: {
          nasabahId: nasabah.id,
        },
        include: {
          hadiah: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

    return {
      statusCode: 200,
      success: true,
      message:
        'Data penukaran poin berhasil diambil',
      data,
    };
  }

  async findAllAdmin(
    bulan?: string,
  ) {
    const where: any = {};

    if (bulan) {
      const start =
        new Date(
          `${bulan}-01T00:00:00`,
        );

      const end = new Date(start);

      end.setMonth(
        end.getMonth() + 1,
      );

      where.createdAt = {
        gte: start,
        lt: end,
      };
    }

    const data =
      await this.prisma.penukaranpoin.findMany({
        where,
        include: {
          nasabah: {
            include: {
              user: {
                select: {
                  username: true,
                },
              },
            },
          },
          hadiah: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

    return {
      statusCode: 200,
      success: true,
      message:
        'Data penukaran poin berhasil diambil',
      data,
    };
  }

  async updateStatus(
    id: string,
    dto: UpdateStatusPenukaranDto,
  ) {
    const penukaran =
      await this.prisma.penukaranpoin.findUnique({
        where: {
          id,
        },
      });

    if (!penukaran) {
      throw new NotFoundException(
        'Data penukaran tidak ditemukan',
      );
    }

    if (
      penukaran.status !== 'diproses'
    ) {
      throw new BadRequestException(
        'Status penukaran sudah diperbarui',
      );
    }

    const result =
      await this.prisma.$transaction(
        async (tx) => {
          if (
            dto.status === 'dibatalkan'
          ) {
            await tx.nasabah.update({
              where: {
                id: penukaran.nasabahId,
              },
              data: {
                saldoPoin: {
                  increment:
                    penukaran.poin,
                },
              },
            });

            await tx.hadiah.update({
              where: {
                id: penukaran.hadiahId,
              },
              data: {
                stok: {
                  increment: 1,
                },
              },
            });
          }

          return tx.penukaranpoin.update({
            where: {
              id,
            },
            data: {
              status: dto.status,
              catatan: dto.catatan,
            },
            include: {
              hadiah: true,
              nasabah: true,
            },
          });
        },
      );

    return {
      statusCode: 200,
      success: true,
      message:
        dto.status === 'selesai'
          ? 'Penukaran berhasil diselesaikan'
          : 'Penukaran berhasil dibatalkan',
      data: result,
    };
  }

  async findOne(id: string) {
    const data =
      await this.prisma.penukaranpoin.findUnique({
        where: {
          id,
        },
        include: {
          hadiah: true,
          nasabah: {
            include: {
              user: {
                select: {
                  username: true,
                },
              },
            },
          },
        },
      });

    if (!data) {
      throw new NotFoundException(
        'Data penukaran tidak ditemukan',
      );
    }

    return {
      statusCode: 200,
      success: true,
      message:
        'Data penukaran berhasil diambil',
      data,
    };
  }
}