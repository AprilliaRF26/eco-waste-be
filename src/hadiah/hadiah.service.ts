import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

import { CreateHadiahDto } from './dto/create-hadiah.dto/create-hadiah.dto.js';
import { UpdateHadiahDto } from './dto/update-hadiah.dto/update-hadiah.dto.js';

@Injectable()
export class HadiahService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const data = await this.prisma.hadiah.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      statusCode: 200,
      success: true,
      message: 'Data hadiah berhasil diambil',
      data,
    };
  }

  async findOne(id: string) {
    const data = await this.prisma.hadiah.findUnique({
      where: {
        id,
      },
    });

    if (!data) {
      throw new NotFoundException(
        'Hadiah tidak ditemukan',
      );
    }

    return {
      statusCode: 200,
      success: true,
      message: 'Data hadiah berhasil diambil',
      data,
    };
  }

  async create(
    dto: CreateHadiahDto,
    foto?: Express.Multer.File,
  ) {
    const existing = await this.prisma.hadiah.findFirst({
      where: {
        namaHadiah: dto.namaHadiah,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Nama hadiah sudah digunakan',
      );
    }

    const fotoPath = foto
      ? `/uploads/hadiah/${foto.filename}`
      : undefined;

    const data = await this.prisma.hadiah.create({
      data: {
        namaHadiah: dto.namaHadiah,
        poinDibutuhkan: dto.poinDibutuhkan,
        stok: dto.stok,
        foto: fotoPath,
      },
    });

    return {
      statusCode: 201,
      success: true,
      message: 'Hadiah berhasil ditambahkan',
      data,
    };
  }

  async update(
    id: string,
    dto: UpdateHadiahDto,
    foto?: Express.Multer.File,
  ) {
    const existing = await this.prisma.hadiah.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      throw new NotFoundException(
        'Hadiah tidak ditemukan',
      );
    }

    if (
      dto.namaHadiah &&
      dto.namaHadiah !== existing.namaHadiah
    ) {
      const duplicate =
        await this.prisma.hadiah.findFirst({
          where: {
            namaHadiah: dto.namaHadiah,
            NOT: {
              id,
            },
          },
        });

      if (duplicate) {
        throw new ConflictException(
          'Nama hadiah sudah digunakan',
        );
      }
    }

    const fotoPath = foto
      ? `/uploads/hadiah/${foto.filename}`
      : undefined;

    const data = await this.prisma.hadiah.update({
      where: {
        id,
      },
      data: {
        ...(dto.namaHadiah !== undefined && {
          namaHadiah: dto.namaHadiah,
        }),
        ...(dto.poinDibutuhkan !== undefined && {
          poinDibutuhkan: dto.poinDibutuhkan,
        }),
        ...(dto.stok !== undefined && {
          stok: dto.stok,
        }),
        ...(fotoPath !== undefined && {
          foto: fotoPath,
        }),
      },
    });

    return {
      statusCode: 200,
      success: true,
      message: 'Hadiah berhasil diperbarui',
      data,
    };
  }

  async remove(id: string) {
    const existing = await this.prisma.hadiah.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      throw new NotFoundException(
        'Hadiah tidak ditemukan',
      );
    }

    const used =
      await this.prisma.penukaranpoin.findFirst({
        where: {
          hadiahId: id,
        },
      });

    if (used) {
      throw new ConflictException(
        'Hadiah tidak dapat dihapus karena sudah digunakan pada transaksi penukaran',
      );
    }

    await this.prisma.hadiah.delete({
      where: {
        id,
      },
    });

    return {
      statusCode: 200,
      success: true,
      message: 'Hadiah berhasil dihapus',
      data: null,
    };
  }
}