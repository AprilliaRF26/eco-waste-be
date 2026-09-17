import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { PrismaService } from '../prisma/prisma.service.js';

import { RegisterNasabahBankDto } from './dto/register-nasabah-bank.dto/register-nasabah-bank.dto.js';
import { RegisterAdminBankDto } from './dto/register-admin-bank.dto/register-admin-bank.dto.js';
import { LoginUserDto } from './dto/login-user.dto/login-user.dto.js';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  private getJwtSecret() {
    return process.env.JWT_SECRET || 'eco-waste-jwt-secret';
  }

  async registerNasabah(
    dto: RegisterNasabahBankDto,
    foto?: Express.Multer.File,
  ) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        username: dto.username,
      },
    });

    if (existingUser) {
      throw new BadRequestException(
        'Username sudah digunakan',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const fotoPath = foto
      ? `/uploads/nasabah/${foto.filename}`
      : null;

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
            tanggalLahir: new Date(dto.tanggalLahir),
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
      message: 'Nasabah berhasil didaftarkan',
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

  async registerAdmin(dto: RegisterAdminBankDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        username: dto.username,
      },
    });

    if (existingUser) {
      throw new BadRequestException(
        'Username sudah digunakan',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        password: passwordHash,
        role: 'ADMIN',
        adminbank: {
          create: {
            namaUnit: dto.namaUnit,
            namaPengelola: dto.namaPengelola,
            telp: dto.telp,
          },
        },
      },
      include: {
        adminbank: true,
      },
    });

    return {
      statusCode: 201,
      success: true,
      message: 'Admin berhasil didaftarkan',
      data: {
        id: user.adminbank?.id,
        username: user.username,
        namaUnit: user.adminbank?.namaUnit,
        namaPengelola: user.adminbank?.namaPengelola,
        telp: user.adminbank?.telp,
      },
    };
  }

  async login(dto: LoginUserDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        username: dto.username,
      },
      include: {
        nasabah: true,
        adminbank: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Username atau password salah',
      );
    }

    const passwordMatch = await bcrypt.compare(
      dto.password,
      user.password,
    );

    if (!passwordMatch) {
      throw new UnauthorizedException(
        'Username atau password salah',
      );
    }

    const token = jwt.sign(
      {
        sub: user.id,
        username: user.username,
        role: user.role,
      },
      this.getJwtSecret(),
      {
        expiresIn: '1d',
      },
    );

    return {
      statusCode: 200,
      success: true,
      message: 'Login berhasil',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          nasabah: user.nasabah,
          admin: user.adminbank,
        },
      },
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        nasabah: true,
        adminbank: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        'User tidak ditemukan',
      );
    }

    return {
      statusCode: 200,
      success: true,
      message: 'Data user berhasil diambil',
      data: {
        id: user.id,
        username: user.username,
        role: user.role,
        nasabah: user.nasabah,
        admin: user.adminbank,
      },
    };
  }
}