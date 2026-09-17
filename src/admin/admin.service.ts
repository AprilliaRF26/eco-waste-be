import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateNasabahDto } from './dto/create-nasabah.dto/create-nasabah.dto.js';
import { UpdateNasabahDto } from './dto/update-nasabah.dto/update-nasabah.dto.js';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllNasabah() {
    const nasabah = await this.prisma.nasabah.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      statusCode: 200,
      success: true,
      message: 'Data nasabah berhasil diambil',
      data: nasabah,
    };
  }

  async findOneNasabah(id: string) {
    const nasabah = await this.prisma.nasabah.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
    });

    if (!nasabah) {
      throw new NotFoundException('Nasabah tidak ditemukan');
    }

    return {
      statusCode: 200,
      success: true,
      message: 'Data nasabah berhasil diambil',
      data: nasabah,
    };
  }

  async createNasabah(
    dto: CreateNasabahDto,
    foto?: Express.Multer.File,
  ) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        username: dto.username,
      },
    });

    if (existingUser) {
      throw new ConflictException('Username sudah digunakan');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const fotoPath = foto
      ? `/uploads/nasabah/${foto.filename}`
      : undefined;

    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        password: passwordHash,
        role: 'NASABAH',
        nasabah: {
          create: {
            namaNasabah: dto.namaNasabah,
            alamat: dto.alamat,
            telp: dto.telp,
            tanggalLahir: dto.tanggalLahir
              ? new Date(dto.tanggalLahir)
              : undefined,
            foto: fotoPath,
          },
        },
      },
      include: {
        nasabah: true,
      },
    });

    return {
      statusCode: 201,
      success: true,
      message: 'Nasabah berhasil ditambahkan',
      data: {
        id: user.nasabah?.id,
        username: user.username,
        namaNasabah: user.nasabah?.namaNasabah,
        alamat: user.nasabah?.alamat,
        telp: user.nasabah?.telp,
        tanggalLahir: user.nasabah?.tanggalLahir,
        foto: user.nasabah?.foto,
        saldoPoin: user.nasabah?.saldoPoin,
      },
    };
  }

  async updateNasabah(
    id: string,
    dto: UpdateNasabahDto,
    foto?: Express.Multer.File,
  ) {
    const nasabah = await this.prisma.nasabah.findUnique({
      where: { id },
    });

    if (!nasabah) {
      throw new NotFoundException('Nasabah tidak ditemukan');
    }

    const fotoPath = foto
      ? `/uploads/nasabah/${foto.filename}`
      : undefined;

    const updated = await this.prisma.nasabah.update({
      where: { id },
      data: {
        ...(dto.namaNasabah !== undefined && {
          namaNasabah: dto.namaNasabah,
        }),

        ...(dto.alamat !== undefined && {
          alamat: dto.alamat,
        }),

        ...(dto.telp !== undefined && {
          telp: dto.telp,
        }),

        ...(dto.tanggalLahir !== undefined && {
          tanggalLahir: new Date(dto.tanggalLahir),
        }),

        ...(fotoPath !== undefined && {
          foto: fotoPath,
        }),
      },
    });

    return {
      statusCode: 200,
      success: true,
      message: 'Data nasabah berhasil diperbarui',
      data: updated,
    };
  }

  async deleteNasabah(id: string) {
  const nasabah = await this.prisma.nasabah.findUnique({
    where: { id },
  });

  if (!nasabah) {
    throw new NotFoundException('Nasabah tidak ditemukan');
  }

  await this.prisma.nasabah.delete({
    where: {
      id: nasabah.id,
    },
  });

  await this.prisma.user.delete({
    where: {
      id: nasabah.userId,
    },
  });

  return {
    statusCode: 200,
    success: true,
    message: 'Nasabah berhasil dihapus',
    data: null,
  };
}
}