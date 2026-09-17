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

import { SetorSampahService } from './setor-sampah.service.js';

import { CreateSetorSampahDto } from './dto/create-setor-sampah.dto/create-setor-sampah.dto.js';
import { VerifySetorSampahDto } from './dto/verify-setor-sampah.dto/verify-setor-sampah.dto.js';

import { JwtGuard } from '../auth/guards/jwt/jwt.guard.js';
import { AdminGuard } from '../auth/guards/admin/admin.guard.js';

@ApiTags('Setor Sampah')
@ApiBearerAuth()
@Controller('api/v1/setor-sampah')
@UseGuards(JwtGuard)
export class SetorSampahController {
  constructor(
    private readonly setorSampahService: SetorSampahService,
  ) {}

  @Post('pengajuan')
  @ApiOperation({
    summary: 'Mengajukan setor sampah',
    description:
      'Nasabah mengajukan setor sampah dengan memasukkan tanggal, detail kategori sampah, dan berat estimasi.',
  })
  @ApiBody({
    type: CreateSetorSampahDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Pengajuan setor sampah berhasil dibuat',
  })
  @ApiResponse({
    status: 400,
    description: 'Data pengajuan tidak valid',
  })
  @ApiResponse({
    status: 401,
    description: 'Token tidak valid',
  })
  async create(
    @Req() req: any,
    @Body() dto: CreateSetorSampahDto,
  ) {
    return this.setorSampahService.create(
      req.user.sub,
      dto,
    );
  }

  @Get('my-setor')
  @ApiOperation({
    summary: 'Melihat riwayat setor sampah sendiri',
    description:
      'Nasabah melihat riwayat setor sampah miliknya. Data dapat difilter berdasarkan bulan.',
  })
  @ApiQuery({
    name: 'bulan',
    required: false,
    description: 'Filter berdasarkan bulan dengan format YYYY-MM',
    example: '2026-09',
  })
  @ApiResponse({
    status: 200,
    description: 'Data setor sampah berhasil diambil',
  })
  @ApiResponse({
    status: 401,
    description: 'Token tidak valid',
  })
  async findMySetor(
    @Req() req: any,
    @Query('bulan') bulan?: string,
  ) {
    return this.setorSampahService.findMySetor(
      req.user.sub,
      bulan,
    );
  }

  @UseGuards(JwtGuard, AdminGuard)
  @Get('admin/list')
  @ApiOperation({
    summary: 'Melihat seluruh pengajuan setor sampah',
    description:
      'Admin melihat seluruh data pengajuan setor sampah dan dapat melakukan filter berdasarkan status dan bulan.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description:
      'Filter berdasarkan status pengajuan',
    example: 'menunggu_konfirmasi',
    enum: [
      'menunggu_konfirmasi',
      'diverifikasi',
      'ditolak',
      'selesai',
    ],
  })
  @ApiQuery({
    name: 'bulan',
    required: false,
    description: 'Filter berdasarkan bulan dengan format YYYY-MM',
    example: '2026-09',
  })
  @ApiResponse({
    status: 200,
    description: 'Data pengajuan berhasil diambil',
  })
  @ApiResponse({
    status: 401,
    description: 'Token tidak valid',
  })
  @ApiResponse({
    status: 403,
    description: 'Akses hanya untuk Admin',
  })
  async findAllAdmin(
    @Query('status') status?: string,
    @Query('bulan') bulan?: string,
  ) {
    return this.setorSampahService.findAllAdmin(
      status,
      bulan,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Melihat detail setor sampah',
    description:
      'Mengambil detail setor sampah berdasarkan ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID setor sampah',
    example: '33cd1488-f21e-4c16-a0f0-045d750625c9',
  })
  @ApiResponse({
    status: 200,
    description: 'Data setor sampah berhasil diambil',
  })
  @ApiResponse({
    status: 404,
    description: 'Data setor sampah tidak ditemukan',
  })
  @ApiResponse({
    status: 401,
    description: 'Token tidak valid',
  })
  async findOne(
    @Param('id') id: string,
  ) {
    return this.setorSampahService.findOne(id);
  }

  @UseGuards(JwtGuard, AdminGuard)
  @Put('admin/verify/:id')
  @ApiOperation({
    summary: 'Verifikasi setor sampah',
    description:
      'Admin memverifikasi pengajuan setor sampah berdasarkan berat aktual dan menentukan status akhir pengajuan.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID setor sampah',
    example: '33cd1488-f21e-4c16-a0f0-045d750625c9',
  })
  @ApiBody({
    type: VerifySetorSampahDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Setor sampah berhasil diverifikasi',
  })
  @ApiResponse({
    status: 400,
    description: 'Data verifikasi tidak valid',
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
    description: 'Data setor sampah tidak ditemukan',
  })
  async verify(
    @Param('id') id: string,
    @Body() dto: VerifySetorSampahDto,
  ) {
    return this.setorSampahService.verify(id, dto);
  }
}