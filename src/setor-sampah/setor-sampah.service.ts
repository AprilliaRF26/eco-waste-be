import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

import { CreateSetorSampahDto } from './dto/create-setor-sampah.dto/create-setor-sampah.dto.js';
import { VerifySetorSampahDto } from './dto/verify-setor-sampah.dto/verify-setor-sampah.dto.js';

@Injectable()
export class SetorSampahService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateKodeSetor(tanggal: Date) {
    const tahun = tanggal.getFullYear();
    const bulan = String(tanggal.getMonth() + 1).padStart(2, '0');

    const jumlahSetor = await this.prisma.setorsampah.count({
      where: {
        tanggal: {
          gte: new Date(tahun, tanggal.getMonth(), 1),
          lt: new Date(tahun, tanggal.getMonth() + 1, 1),
        },
      },
    });

    const nomor = String(jumlahSetor + 1).padStart(4, '0');

    return `STR-${tahun}${bulan}-${nomor}`;
  }

  async create(userId: string, dto: CreateSetorSampahDto) {
    const nasabah = await this.prisma.nasabah.findUnique({
      where: {
        userId,
      },
    });

    if (!nasabah) {
      throw new NotFoundException(
        'Data nasabah tidak ditemukan',
      );
    }

    if (!dto.detail || dto.detail.length === 0) {
      throw new BadRequestException(
        'Minimal harus ada satu jenis sampah',
      );
    }

    const kategoriIds = dto.detail.map(
      (item) => item.kategoriSampahId,
    );

    const kategori = await this.prisma.kategorisampah.findMany({
      where: {
        id: {
          in: kategoriIds,
        },
      },
    });

    if (kategori.length !== kategoriIds.length) {
      throw new BadRequestException(
        'Ada kategori sampah yang tidak ditemukan',
      );
    }

    const tanggal = new Date(dto.tanggal);
    const kodeSetor = await this.generateKodeSetor(tanggal);

    const data = await this.prisma.setorsampah.create({
      data: {
        kodeSetor,
        nasabahId: nasabah.id,
        tanggal,
        catatan: dto.catatan,
        status: 'menunggu_konfirmasi',
        totalBeratKg: 0,
        totalPoin: 0,
        detailsetor: {
          create: dto.detail.map((item) => ({
            kategoriSampahId: item.kategoriSampahId,
            beratKg: item.beratKg,
          })),
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

    return {
      statusCode: 201,
      success: true,
      message: 'Pengajuan setor sampah berhasil dibuat',
      data,
    };
  }

  async findMySetor(
    userId: string,
    bulan?: string,
  ) {
    const nasabah = await this.prisma.nasabah.findUnique({
      where: {
        userId,
      },
    });

    if (!nasabah) {
      throw new NotFoundException(
        'Data nasabah tidak ditemukan',
      );
    }

    const where: any = {
      nasabahId: nasabah.id,
    };

    if (bulan) {
      const start = new Date(`${bulan}-01T00:00:00`);
      const end = new Date(start);

      end.setMonth(end.getMonth() + 1);

      where.tanggal = {
        gte: start,
        lt: end,
      };
    }

    const data = await this.prisma.setorsampah.findMany({
      where,
      include: {
        detailsetor: {
          include: {
            kategorisampah: true,
          },
        },
      },
      orderBy: {
        tanggal: 'desc',
      },
    });

    return {
      statusCode: 200,
      success: true,
      message: 'Data setor sampah berhasil diambil',
      data,
    };
  }

  async findAllAdmin(
    status?: string,
    bulan?: string,
  ) {
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (bulan) {
      const start = new Date(`${bulan}-01T00:00:00`);
      const end = new Date(start);

      end.setMonth(end.getMonth() + 1);

      where.tanggal = {
        gte: start,
        lt: end,
      };
    }

    const data = await this.prisma.setorsampah.findMany({
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
        detailsetor: {
          include: {
            kategorisampah: true,
          },
        },
      },
      orderBy: {
        tanggal: 'desc',
      },
    });

    return {
      statusCode: 200,
      success: true,
      message: 'Data setor sampah berhasil diambil',
      data,
    };
  }

  async findOne(id: string) {
    const data = await this.prisma.setorsampah.findUnique({
      where: {
        id,
      },
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
        detailsetor: {
          include: {
            kategorisampah: true,
          },
        },
      },
    });

    if (!data) {
      throw new NotFoundException(
        'Data setor sampah tidak ditemukan',
      );
    }

    return {
      statusCode: 200,
      success: true,
      message: 'Data setor sampah berhasil diambil',
      data,
    };
  }

  async verify(
    id: string,
    dto: VerifySetorSampahDto,
  ) {
    const setor = await this.prisma.setorsampah.findUnique({
      where: {
        id,
      },
      include: {
        detailsetor: true,
      },
    });

    if (!setor) {
      throw new NotFoundException(
        'Data setor sampah tidak ditemukan',
      );
    }

    if (setor.status !== 'menunggu_konfirmasi') {
      throw new BadRequestException(
        'Pengajuan ini sudah diverifikasi sebelumnya',
      );
    }

    // Jika pengajuan ditolak
    if (dto.status === 'ditolak') {
      const updated = await this.prisma.setorsampah.update({
        where: {
          id,
        },
        data: {
          status: 'ditolak',
          catatanAdmin: dto.catatanAdmin,
        },
        include: {
          detailsetor: {
            include: {
              kategorisampah: true,
            },
          },
        },
      });

      return {
        statusCode: 200,
        success: true,
        message: 'Pengajuan setor sampah ditolak',
        data: updated,
      };
    }

    // Jika diverifikasi, itemsReal wajib ada
    if (!dto.itemsReal || dto.itemsReal.length === 0) {
      throw new BadRequestException(
        'itemsReal wajib diisi saat verifikasi',
      );
    }

    const detailIds = setor.detailsetor.map(
      (item) => item.id,
    );

    // Pastikan setiap detail yang dikirim memang milik setor ini
    for (const item of dto.itemsReal) {
      if (!detailIds.includes(item.id)) {
        throw new BadRequestException(
          `Detail setor ${item.id} tidak ditemukan`,
        );
      }

      if (item.beratKgReal < 0) {
        throw new BadRequestException(
          'Berat sampah tidak boleh negatif',
        );
      }
    }

    // Pastikan jumlah item real sama dengan jumlah detail pengajuan
    if (dto.itemsReal.length !== setor.detailsetor.length) {
      throw new BadRequestException(
        'Semua detail setor harus memiliki berat real',
      );
    }

    const details = await this.prisma.detailsetor.findMany({
      where: {
        id: {
          in: detailIds,
        },
      },
      include: {
        kategorisampah: true,
      },
    });

    let totalBeratKg = 0;
    let totalPoin = 0;

    for (const itemReal of dto.itemsReal) {
      const current = details.find(
        (detail) => detail.id === itemReal.id,
      );

      if (!current) {
        throw new BadRequestException(
          'Detail setor tidak ditemukan',
        );
      }

      // Pastikan kategori sesuai dengan detail pengajuan
      if (
        current.kategoriSampahId !==
        itemReal.kategoriSampahId
      ) {
        throw new BadRequestException(
          `Kategori sampah pada detail ${itemReal.id} tidak sesuai`,
        );
      }

      totalBeratKg += itemReal.beratKgReal;

      totalPoin += Math.floor(
        itemReal.beratKgReal *
          current.kategorisampah.poinPerKg,
      );
    }

    // Update detail, setor, dan saldo poin
    // dalam satu transaction
    const result = await this.prisma.$transaction(
      async (tx) => {
        for (const itemReal of dto.itemsReal!) {
          await tx.detailsetor.update({
            where: {
              id: itemReal.id,
            },
            data: {
              beratKg: itemReal.beratKgReal,
            },
          });
        }

        const updatedSetor =
          await tx.setorsampah.update({
            where: {
              id,
            },
            data: {
              status: 'diverifikasi',
              totalBeratKg,
              totalPoin,
              catatanAdmin: dto.catatanAdmin,
            },
            include: {
              detailsetor: {
                include: {
                  kategorisampah: true,
                },
              },
            },
          });

        await tx.nasabah.update({
          where: {
            id: setor.nasabahId,
          },
          data: {
            saldoPoin: {
              increment: totalPoin,
            },
          },
        });

        return updatedSetor;
      },
    );

    return {
      statusCode: 200,
      success: true,
      message: 'Setor sampah berhasil diverifikasi',
      data: result,
    };
  }
}