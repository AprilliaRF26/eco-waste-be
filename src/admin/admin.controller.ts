import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

import { AdminService } from './admin.service.js';
import { CreateNasabahDto } from './dto/create-nasabah.dto/create-nasabah.dto.js';
import { UpdateNasabahDto } from './dto/update-nasabah.dto/update-nasabah.dto.js';

import { JwtGuard } from '../auth/guards/jwt/jwt.guard.js';
import { AdminGuard } from '../auth/guards/admin/admin.guard.js';

const uploadPath = './uploads/nasabah';

if (!existsSync(uploadPath)) {
  mkdirSync(uploadPath, { recursive: true });
}

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('api/v1/admin')
@UseGuards(JwtGuard, AdminGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
  ) {}

  @Get('nasabah')
  @ApiOperation({
    summary: 'Menampilkan semua Nasabah',
    description:
      'Mengambil seluruh data Nasabah yang terdaftar. Hanya dapat diakses oleh Admin.',
  })
  @ApiResponse({
    status: 200,
    description: 'Data Nasabah berhasil diambil',
  })
  @ApiResponse({
    status: 401,
    description: 'Token tidak valid',
  })
  @ApiResponse({
    status: 403,
    description: 'Akses hanya untuk Admin',
  })
  async findAllNasabah() {
    return this.adminService.findAllNasabah();
  }

  @Post('nasabah')
  @ApiOperation({
    summary: 'Menambahkan Nasabah',
    description:
      'Admin dapat membuat akun Nasabah baru dan mengunggah foto profil.',
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
    description: 'Nasabah berhasil ditambahkan',
  })
  @ApiResponse({
    status: 400,
    description: 'Data tidak valid atau username sudah digunakan',
  })
  @ApiResponse({
    status: 401,
    description: 'Token tidak valid',
  })
  @ApiResponse({
    status: 403,
    description: 'Akses hanya untuk Admin',
  })
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: diskStorage({
        destination: uploadPath,
        filename: (req, file, callback) => {
          const uniqueName = `${Date.now()}-${Math.round(
            Math.random() * 1e9,
          )}${extname(file.originalname)}`;

          callback(null, uniqueName);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          return callback(
            new Error('File harus berupa gambar'),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  async createNasabah(
    @Body() dto: CreateNasabahDto,
    @UploadedFile() foto: Express.Multer.File,
  ) {
    return this.adminService.createNasabah(dto, foto);
  }

  @Get('nasabah/:id')
  @ApiOperation({
    summary: 'Menampilkan detail Nasabah',
    description:
      'Mengambil detail satu Nasabah berdasarkan ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID Nasabah',
    example: '21dc8e35-8bda-4da8-a8d8-4e6e433ff5a4',
  })
  @ApiResponse({
    status: 200,
    description: 'Data Nasabah berhasil diambil',
  })
  @ApiResponse({
    status: 404,
    description: 'Nasabah tidak ditemukan',
  })
  @ApiResponse({
    status: 401,
    description: 'Token tidak valid',
  })
  @ApiResponse({
    status: 403,
    description: 'Akses hanya untuk Admin',
  })
  async findOneNasabah(
    @Param('id') id: string,
  ) {
    return this.adminService.findOneNasabah(id);
  }

  @Put('nasabah/:id')
  @ApiOperation({
    summary: 'Mengubah data Nasabah',
    description:
      'Admin dapat mengubah data Nasabah dan mengganti foto profil.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID Nasabah',
    example: '21dc8e35-8bda-4da8-a8d8-4e6e433ff5a4',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
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
          description: 'Foto profil baru (opsional)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Data Nasabah berhasil diperbarui',
  })
  @ApiResponse({
    status: 404,
    description: 'Nasabah tidak ditemukan',
  })
  @ApiResponse({
    status: 401,
    description: 'Token tidak valid',
  })
  @ApiResponse({
    status: 403,
    description: 'Akses hanya untuk Admin',
  })
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: diskStorage({
        destination: uploadPath,
        filename: (req, file, callback) => {
          const uniqueName = `${Date.now()}-${Math.round(
            Math.random() * 1e9,
          )}${extname(file.originalname)}`;

          callback(null, uniqueName);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          return callback(
            new Error('File harus berupa gambar'),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  async updateNasabah(
    @Param('id') id: string,
    @Body() dto: UpdateNasabahDto,
    @UploadedFile() foto: Express.Multer.File,
  ) {
    return this.adminService.updateNasabah(
      id,
      dto,
      foto,
    );
  }

  @Delete('nasabah/:id')
  @ApiOperation({
    summary: 'Menghapus Nasabah',
    description:
      'Menghapus data Nasabah berdasarkan ID. Hanya dapat dilakukan oleh Admin.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID Nasabah',
    example: '21dc8e35-8bda-4da8-a8d8-4e6e433ff5a4',
  })
  @ApiResponse({
    status: 200,
    description: 'Nasabah berhasil dihapus',
  })
  @ApiResponse({
    status: 404,
    description: 'Nasabah tidak ditemukan',
  })
  @ApiResponse({
    status: 401,
    description: 'Token tidak valid',
  })
  @ApiResponse({
    status: 403,
    description: 'Akses hanya untuk Admin',
  })
  async deleteNasabah(
    @Param('id') id: string,
  ) {
    return this.adminService.deleteNasabah(id);
  }
}