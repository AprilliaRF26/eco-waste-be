import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { PenukaranPoinService } from './penukaran-poin.service.js';

import { TukarPoinDto } from './dto/tukar-poin.dto/tukar-poin.dto.js';

import { UpdateStatusPenukaranDto } from './dto/update-status-penukaran.dto/update-status-penukaran.dto.js';

import { JwtGuard } from '../auth/guards/jwt/jwt.guard.js';

import { AdminGuard } from '../auth/guards/admin/admin.guard.js';

@ApiTags('Penukaran Poin')
@Controller('api/v1/penukaran-poin')
@UseGuards(JwtGuard)
@ApiBearerAuth()
export class PenukaranPoinController {
  constructor(
    private readonly penukaranPoinService: PenukaranPoinService,
  ) {}

  @Post('tukar')
  @ApiOperation({
    summary: 'Menukar poin dengan hadiah',
    description:
      'Nasabah menukarkan poin yang dimiliki dengan hadiah yang tersedia.',
  })
  @ApiBody({
    type: TukarPoinDto,
    examples: {
      contoh: {
        summary: 'Contoh penukaran poin',
        value: {
          hadiahId: 'f5aa476d-1115-4c70-9f44-4be3dc959beb',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Poin berhasil ditukarkan',
  })
  @ApiResponse({
    status: 400,
    description: 'Poin tidak mencukupi atau stok hadiah tidak tersedia',
  })
  @ApiResponse({
    status: 401,
    description: 'Token tidak valid atau tidak ada',
  })
  async tukar(
    @Req() req: any,
    @Body() dto: TukarPoinDto,
  ) {
    return this.penukaranPoinService.tukar(
      req.user.sub,
      dto,
    );
  }

  @Get('my-penukaran')
  @ApiOperation({
    summary: 'Menampilkan riwayat penukaran poin',
    description:
      'Nasabah melihat seluruh riwayat penukaran poin miliknya.',
  })
  @ApiResponse({
    status: 200,
    description: 'Riwayat penukaran berhasil diambil',
  })
  @ApiResponse({
    status: 401,
    description: 'Token tidak valid atau tidak ada',
  })
  async findMyPenukaran(
    @Req() req: any,
  ) {
    return this.penukaranPoinService.findMyPenukaran(
      req.user.sub,
    );
  }

  @UseGuards(JwtGuard, AdminGuard)
  @Get('admin/list')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Menampilkan seluruh penukaran poin',
    description:
      'Admin melihat daftar seluruh transaksi penukaran poin dan dapat memfilter berdasarkan bulan.',
  })
  @ApiQuery({
    name: 'bulan',
    required: false,
    description: 'Filter berdasarkan bulan dengan format YYYY-MM',
    example: '2026-09',
  })
  @ApiResponse({
    status: 200,
    description: 'Daftar penukaran berhasil diambil',
  })
  @ApiResponse({
    status: 401,
    description: 'Token tidak valid atau tidak ada',
  })
  @ApiResponse({
    status: 403,
    description: 'Akses hanya untuk admin',
  })
  async findAllAdmin(
    @Query('bulan') bulan?: string,
  ) {
    return this.penukaranPoinService.findAllAdmin(
      bulan,
    );
  }

  @UseGuards(JwtGuard, AdminGuard)
  @Put('admin/status/:id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Mengubah status penukaran poin',
    description:
      'Admin mengubah status transaksi penukaran menjadi selesai atau dibatalkan.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID transaksi penukaran',
    example: 'ae02deb2-2098-4647-82c6-248a877bf566',
  })
  @ApiBody({
    type: UpdateStatusPenukaranDto,
    examples: {
      selesai: {
        summary: 'Mengubah menjadi selesai',
        value: {
          status: 'selesai',
          catatan: 'Hadiah sudah diserahkan kepada nasabah',
        },
      },
      dibatalkan: {
        summary: 'Membatalkan penukaran',
        value: {
          status: 'dibatalkan',
          catatan: 'Hadiah tidak tersedia',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Status penukaran berhasil diperbarui',
  })
  @ApiResponse({
    status: 400,
    description: 'Status tidak valid',
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
    description: 'Data penukaran tidak ditemukan',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusPenukaranDto,
  ) {
    return this.penukaranPoinService.updateStatus(
      id,
      dto,
    );
  }

  @Get('nota/:id')
  @ApiOperation({
    summary: 'Menampilkan nota penukaran',
    description:
      'Mengambil detail transaksi penukaran poin berdasarkan ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID transaksi penukaran',
    example: 'ae02deb2-2098-4647-82c6-248a877bf566',
  })
  @ApiResponse({
    status: 200,
    description: 'Nota penukaran berhasil diambil',
  })
  @ApiResponse({
    status: 401,
    description: 'Token tidak valid atau tidak ada',
  })
  @ApiResponse({
    status: 404,
    description: 'Data penukaran tidak ditemukan',
  })
  async nota(
    @Param('id') id: string,
  ) {
    return this.penukaranPoinService.findOne(id);
  }
}