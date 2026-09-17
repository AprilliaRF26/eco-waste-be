import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { RekapitulasiService } from './rekapitulasi.service.js';

import { JwtGuard } from '../auth/guards/jwt/jwt.guard.js';
import { AdminGuard } from '../auth/guards/admin/admin.guard.js';

@ApiTags('Rekapitulasi')
@Controller('api/v1/rekapitulasi')
@UseGuards(JwtGuard, AdminGuard)
@ApiBearerAuth()
export class RekapitulasiController {
  constructor(
    private readonly rekapitulasiService: RekapitulasiService,
  ) {}

  @Get('bulanan')
  @ApiOperation({
    summary: 'Menampilkan rekapitulasi bulanan',
    description:
      'Admin melihat rekapitulasi transaksi setor sampah berdasarkan bulan.',
  })
  @ApiQuery({
    name: 'bulan',
    required: true,
    description: 'Periode rekapitulasi dengan format YYYY-MM',
    example: '2026-09',
  })
  @ApiResponse({
    status: 200,
    description: 'Rekapitulasi bulanan berhasil diambil',
  })
  @ApiResponse({
    status: 400,
    description: 'Format bulan tidak valid',
  })
  @ApiResponse({
    status: 401,
    description: 'Token tidak valid atau tidak ada',
  })
  @ApiResponse({
    status: 403,
    description: 'Akses hanya untuk admin',
  })
  async getBulanan(
    @Query('bulan') bulan: string,
  ) {
    return this.rekapitulasiService.getBulanan(bulan);
  }
}