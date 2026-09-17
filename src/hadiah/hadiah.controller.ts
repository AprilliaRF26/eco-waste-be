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
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { HadiahService } from './hadiah.service.js';
import { CreateHadiahDto } from './dto/create-hadiah.dto/create-hadiah.dto.js';
import { UpdateHadiahDto } from './dto/update-hadiah.dto/update-hadiah.dto.js';
import { JwtGuard } from '../auth/guards/jwt/jwt.guard.js';
import { AdminGuard } from '../auth/guards/admin/admin.guard.js';

const uploadPath = './uploads/hadiah';

if (!existsSync(uploadPath)) {
  mkdirSync(uploadPath, { recursive: true });
}

@ApiTags('Hadiah')
@Controller('api/v1/hadiah')
export class HadiahController {
  constructor(
    private readonly hadiahService: HadiahService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Menampilkan semua hadiah',
    description: 'Mengambil seluruh data hadiah yang tersedia.',
  })
  @ApiResponse({
    status: 200,
    description: 'Data hadiah berhasil diambil',
  })
  async findAll() {
    return this.hadiahService.findAll();
  }

  @UseGuards(JwtGuard, AdminGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Menambahkan hadiah',
    description: 'Admin menambahkan hadiah baru beserta foto hadiah.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['namaHadiah', 'poinDibutuhkan', 'stok'],
      properties: {
        namaHadiah: {
          type: 'string',
          example: 'Voucher Belanja Rp20.000',
        },
        poinDibutuhkan: {
          type: 'integer',
          example: 100,
        },
        stok: {
          type: 'integer',
          example: 10,
        },
        foto: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Hadiah berhasil ditambahkan',
  })
  @ApiResponse({
    status: 401,
    description: 'Token tidak valid atau tidak ada',
  })
  @ApiResponse({
    status: 403,
    description: 'Akses hanya untuk admin',
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
    @Body() dto: CreateHadiahDto,
    @UploadedFile() foto?: Express.Multer.File,
  ) {
    return this.hadiahService.create(dto, foto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Menampilkan detail hadiah',
    description: 'Mengambil data hadiah berdasarkan ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID hadiah',
    example: 'f5aa476d-1115-4c70-9f44-4be3dc959beb',
  })
  @ApiResponse({
    status: 200,
    description: 'Detail hadiah berhasil diambil',
  })
  @ApiResponse({
    status: 404,
    description: 'Hadiah tidak ditemukan',
  })
  async findOne(
    @Param('id') id: string,
  ) {
    return this.hadiahService.findOne(id);
  }

  @UseGuards(JwtGuard, AdminGuard)
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Mengubah data hadiah',
    description: 'Admin mengubah data hadiah dan dapat mengganti foto hadiah.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID hadiah yang akan diubah',
    example: 'f5aa476d-1115-4c70-9f44-4be3dc959beb',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        namaHadiah: {
          type: 'string',
          example: 'Voucher Belanja Rp25.000',
        },
        poinDibutuhkan: {
          type: 'integer',
          example: 125,
        },
        stok: {
          type: 'integer',
          example: 10,
        },
        foto: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Hadiah berhasil diperbarui',
  })
  @ApiResponse({
    status: 401,
    description: 'Token tidak valid atau tidak ada',
  })
  @ApiResponse({
    status: 403,
    description: 'Akses hanya untuk admin',
  })
  @ApiResponse({
    status: 404,
    description: 'Hadiah tidak ditemukan',
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
    @Body() dto: UpdateHadiahDto,
    @UploadedFile() foto?: Express.Multer.File,
  ) {
    return this.hadiahService.update(id, dto, foto);
  }

  @UseGuards(JwtGuard, AdminGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Menghapus hadiah',
    description: 'Admin menghapus data hadiah berdasarkan ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID hadiah yang akan dihapus',
    example: 'f5aa476d-1115-4c70-9f44-4be3dc959beb',
  })
  @ApiResponse({
    status: 200,
    description: 'Hadiah berhasil dihapus',
  })
  @ApiResponse({
    status: 401,
    description: 'Token tidak valid atau tidak ada',
  })
  @ApiResponse({
    status: 403,
    description: 'Akses hanya untuk admin',
  })
  @ApiResponse({
    status: 404,
    description: 'Hadiah tidak ditemukan',
  })
  async remove(
    @Param('id') id: string,
  ) {
    return this.hadiahService.remove(id);
  }
}