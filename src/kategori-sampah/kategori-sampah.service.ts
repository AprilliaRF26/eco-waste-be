import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

import { CreateKategoriSampahDto } from './dto/create-kategori-sampah.dto/create-kategori-sampah.dto.js';
import { UpdateKategoriSampahDto } from './dto/update-kategori-sampah.dto/update-kategori-sampah.dto.js';

@Injectable()
export class KategoriSampahService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const data = await this.prisma.kategorisampah.findMany({
      orderBy: {
        namaKategori: 'asc',
      },
    });

    return {
      statusCode: 200,
      success: true,
      message: 'Data kategori sampah berhasil diambil',
      data,
    };
  }

  async findOne(id: string) {
    const data = await this.prisma.kategorisampah.findUnique({
      where: { id },
    });

    if (!data) {
      throw new NotFoundException('Kategori sampah tidak ditemukan');
    }

    return {
      statusCode: 200,
      success: true,
      message: 'Data kategori sampah berhasil diambil',
      data,
    };
  }

  async create(
    dto: CreateKategoriSampahDto,
    foto?: Express.Multer.File,
  ) {
    const existing = await this.prisma.kategorisampah.findFirst({
      where: {
        namaKategori: dto.namaKategori,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Nama kategori sampah sudah digunakan',
      );
    }

    const fotoPath = foto
      ? `/uploads/kategori-sampah/${foto.filename}`
      : undefined;

    const data = await this.prisma.kategorisampah.create({
      data: {
        namaKategori: dto.namaKategori,
        hargaPerKg: dto.hargaPerKg,
        poinPerKg: dto.poinPerKg,
        jenis: dto.jenis,
        foto: fotoPath,
      },
    });

    return {
      statusCode: 201,
      success: true,
      message: 'Kategori sampah berhasil ditambahkan',
      data,
    };
  }

  async update(
    id: string,
    dto: UpdateKategoriSampahDto,
    foto?: Express.Multer.File,
  ) {
    const existing = await this.prisma.kategorisampah.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(
        'Kategori sampah tidak ditemukan',
      );
    }

    if (
      dto.namaKategori &&
      dto.namaKategori !== existing.namaKategori
    ) {
      const duplicate =
        await this.prisma.kategorisampah.findFirst({
          where: {
            namaKategori: dto.namaKategori,
            NOT: {
              id,
            },
          },
        });

      if (duplicate) {
        throw new ConflictException(
          'Nama kategori sampah sudah digunakan',
        );
      }
    }

    const fotoPath = foto
      ? `/uploads/kategori-sampah/${foto.filename}`
      : undefined;

    const data = await this.prisma.kategorisampah.update({
      where: { id },
      data: {
        ...(dto.namaKategori !== undefined && {
          namaKategori: dto.namaKategori,
        }),
        ...(dto.hargaPerKg !== undefined && {
          hargaPerKg: dto.hargaPerKg,
        }),
        ...(dto.poinPerKg !== undefined && {
          poinPerKg: dto.poinPerKg,
        }),
        ...(dto.jenis !== undefined && {
          jenis: dto.jenis,
        }),
        ...(fotoPath !== undefined && {
          foto: fotoPath,
        }),
      },
    });

    return {
      statusCode: 200,
      success: true,
      message: 'Kategori sampah berhasil diperbarui',
      data,
    };
  }

  async remove(id: string) {
    const existing = await this.prisma.kategorisampah.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(
        'Kategori sampah tidak ditemukan',
      );
    }

    const detail = await this.prisma.detailsetor.findFirst({
      where: {
        kategoriSampahId: id,
      },
    });

    if (detail) {
      throw new ConflictException(
        'Kategori sampah tidak dapat dihapus karena sudah digunakan pada transaksi setor sampah',
      );
    }

    await this.prisma.kategorisampah.delete({
      where: { id },
    });

    return {
      statusCode: 200,
      success: true,
      message: 'Kategori sampah berhasil dihapus',
      data: null,
    };
  }
}