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

import { KategoriSampahService } from './kategori-sampah.service.js';

import { CreateKategoriSampahDto } from './dto/create-kategori-sampah.dto/create-kategori-sampah.dto.js';
import { UpdateKategoriSampahDto } from './dto/update-kategori-sampah.dto/update-kategori-sampah.dto.js';

import { JwtGuard } from '../auth/guards/jwt/jwt.guard.js';
import { AdminGuard } from '../auth/guards/admin/admin.guard.js';

const uploadPath = './uploads/kategori-sampah';

if (!existsSync(uploadPath)) {
  mkdirSync(uploadPath, { recursive: true });
}

@ApiTags('Kategori Sampah')
@Controller('api/v1/kategori-sampah')
export class KategoriSampahController {
  constructor(
    private readonly kategoriSampahService: KategoriSampahService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Menampilkan semua kategori sampah',
    description: 'Mengambil seluruh data kategori sampah.',
  })
  @ApiResponse({
    status: 200,
    description: 'Data kategori sampah berhasil diambil',
  })
  async findAll() {
    return this.kategoriSampahService.findAll();
  }

  @UseGuards(JwtGuard, AdminGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Menambahkan kategori sampah',
    description:
      'Admin dapat menambahkan kategori sampah baru beserta foto.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: [
        'namaKategori',
        'hargaPerKg',
        'poinPerKg',
        'jenis',
      ],
      properties: {
        namaKategori: {
          type: 'string',
          example: 'Plastik',
        },
        hargaPerKg: {
          type: 'integer',
          example: 3500,
        },
        poinPerKg: {
          type: 'integer',
          example: 12,
        },
        jenis: {
          type: 'string',
          enum: ['plastik', 'kertas', 'logam', 'kaca'],
          example: 'plastik',
        },
        foto: {
          type: 'string',
          format: 'binary',
          description: 'Foto kategori sampah (opsional)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Kategori sampah berhasil ditambahkan',
  })
  @ApiResponse({
    status: 400,
    description: 'Data tidak valid atau kategori sudah ada',
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
  async create(
    @Body() dto: CreateKategoriSampahDto,
    @UploadedFile() foto: Express.Multer.File,
  ) {
    return this.kategoriSampahService.create(dto, foto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Menampilkan detail kategori sampah',
    description:
      'Mengambil detail kategori sampah berdasarkan ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID kategori sampah',
    example: 'd86a9dd6-71e7-4c25-9056-e43fed873796',
  })
  @ApiResponse({
    status: 200,
    description: 'Data kategori sampah berhasil diambil',
  })
  @ApiResponse({
    status: 404,
    description: 'Kategori sampah tidak ditemukan',
  })
  async findOne(
    @Param('id') id: string,
  ) {
    return this.kategoriSampahService.findOne(id);
  }

  @UseGuards(JwtGuard, AdminGuard)
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Mengubah kategori sampah',
    description:
      'Admin dapat mengubah data kategori sampah dan mengganti foto.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID kategori sampah',
    example: 'd86a9dd6-71e7-4c25-9056-e43fed873796',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        namaKategori: {
          type: 'string',
          example: 'Plastik',
        },
        hargaPerKg: {
          type: 'integer',
          example: 3500,
        },
        poinPerKg: {
          type: 'integer',
          example: 12,
        },
        jenis: {
          type: 'string',
          enum: ['plastik', 'kertas', 'logam', 'kaca'],
          example: 'plastik',
        },
        foto: {
          type: 'string',
          format: 'binary',
          description: 'Foto kategori baru (opsional)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Kategori sampah berhasil diperbarui',
  })
  @ApiResponse({
    status: 400,
    description: 'Data tidak valid atau kategori sudah ada',
  })
  @ApiResponse({
    status: 401,
    description: 'Token tidak valid',
  })
  @ApiResponse({
    status: 403,
    description: 'Akses hanya untuk Admin',
  })
  @ApiResponse({
    status: 404,
    description: 'Kategori sampah tidak ditemukan',
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
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateKategoriSampahDto,
    @UploadedFile() foto: Express.Multer.File,
  ) {
    return this.kategoriSampahService.update(
      id,
      dto,
      foto,
    );
  }

  @UseGuards(JwtGuard, AdminGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Menghapus kategori sampah',
    description:
      'Admin dapat menghapus kategori sampah berdasarkan ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID kategori sampah',
    example: 'd86a9dd6-71e7-4c25-9056-e43fed873796',
  })
  @ApiResponse({
    status: 200,
    description: 'Kategori sampah berhasil dihapus',
  })
  @ApiResponse({
    status: 400,
    description:
      'Kategori tidak dapat dihapus karena sudah digunakan pada setor sampah',
  })
  @ApiResponse({
    status: 401,
    description: 'Token tidak valid',
  })
  @ApiResponse({
    status: 403,
    description: 'Akses hanya untuk Admin',
  })
  @ApiResponse({
    status: 404,
    description: 'Kategori sampah tidak ditemukan',
  })
  async remove(
    @Param('id') id: string,
  ) {
    return this.kategoriSampahService.remove(id);
  }
}