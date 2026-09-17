import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

import { AuthService } from './auth.service.js';
import { RegisterNasabahBankDto } from './dto/register-nasabah-bank.dto/register-nasabah-bank.dto.js';
import { RegisterAdminBankDto } from './dto/register-admin-bank.dto/register-admin-bank.dto.js';
import { LoginUserDto } from './dto/login-user.dto/login-user.dto.js';
import { JwtGuard } from './guards/jwt/jwt.guard.js';

@ApiTags('Auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('nasabah/register')
  @ApiOperation({
    summary: 'Registrasi Nasabah',
    description:
      'Mendaftarkan akun Nasabah baru. Registrasi dapat dilakukan tanpa login dan mendukung upload foto profil.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: [
        'username',
        'password',
        'namaNasabah',
        'alamat',
        'telp',
        'tanggalLahir',
      ],
      properties: {
        username: {
          type: 'string',
          example: 'nasabah_dewi',
        },
        password: {
          type: 'string',
          example: 'password123',
        },
        namaNasabah: {
          type: 'string',
          example: 'Dewi Lestari',
        },
        alamat: {
          type: 'string',
          example: 'Jl. Kenanga No. 5, RT 02/01',
        },
        telp: {
          type: 'string',
          example: '081987654321',
        },
        tanggalLahir: {
          type: 'string',
          format: 'date',
          example: '2007-05-15',
        },
        foto: {
          type: 'string',
          format: 'binary',
          description: 'Foto profil Nasabah (opsional)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Nasabah berhasil didaftarkan',
  })
  @ApiResponse({
    status: 400,
    description: 'Username sudah digunakan atau data tidak valid',
  })
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: diskStorage({
        destination: (_req, _file, callback) => {
          const uploadPath = './uploads/nasabah';

          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }

          callback(null, uploadPath);
        },

        filename: (_req, file, callback) => {
          const uniqueName = `${Date.now()}-${Math.round(
            Math.random() * 1_000_000_000,
          )}${extname(file.originalname)}`;

          callback(null, uniqueName);
        },
      }),

      fileFilter: (_req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          return callback(
            new Error('File foto harus berupa gambar'),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  async registerNasabah(
    @Body() dto: RegisterNasabahBankDto,
    @UploadedFile() foto?: Express.Multer.File,
  ) {
    return this.authService.registerNasabah(dto, foto);
  }

  @Post('admin/register')
  @ApiOperation({
    summary: 'Registrasi Admin',
    description: 'Mendaftarkan akun Admin Bank Sampah baru.',
  })
  @ApiBody({
    type: RegisterAdminBankDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Admin berhasil didaftarkan',
  })
  @ApiResponse({
    status: 400,
    description: 'Username sudah digunakan atau data tidak valid',
  })
  async registerAdmin(
    @Body() dto: RegisterAdminBankDto,
  ) {
    return this.authService.registerAdmin(dto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login',
    description:
      'Login menggunakan akun Admin atau Nasabah untuk mendapatkan JWT token.',
  })
  @ApiBody({
    type: LoginUserDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Login berhasil',
  })
  @ApiResponse({
    status: 401,
    description: 'Username atau password salah',
  })
  async login(
    @Body() dto: LoginUserDto,
  ) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Data user yang sedang login',
    description:
      'Mengambil informasi akun Admin atau Nasabah berdasarkan JWT token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Data user berhasil diambil',
  })
  @ApiResponse({
    status: 401,
    description: 'Token tidak valid atau user tidak ditemukan',
  })
  async me(@Req() req: any) {
    return this.authService.me(req.user.sub);
  }
}